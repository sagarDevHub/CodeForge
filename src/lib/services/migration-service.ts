// src/lib/services/github-migration-service.ts

import { db } from "@/server/db";
import { octokit } from "@/lib/github/github";
import { answerQuestion } from "@/lib/ai/groq";

interface GitHubMigrationResult {
  success: boolean;
  message: string;
  prUrl?: string;
  branchName?: string;
  prNumber?: number;
  changes?: Array<{
    filePath: string;
    status: "modified" | "created" | "deleted" | "error";
    error?: string;
  }>;
}

interface RollbackResult {
  success: boolean;
  message: string;
  prClosed?: boolean;
  branchDeleted?: boolean;
}

export class GitHubMigrationService {
  /**
   * Parse GitHub URL to get owner and repo
   */
  private static parseGitHubUrl(url: string): { owner: string; repo: string } {
    try {
      let cleanUrl = url;

      cleanUrl = cleanUrl.replace(/^https?:\/\//, "");
      cleanUrl = cleanUrl.replace(/^git@/, "");
      cleanUrl = cleanUrl.replace(/^github\.com[:/]/, "");

      cleanUrl = cleanUrl.replace(/\.git$/, "");

      const parts = cleanUrl.split("/").filter(Boolean);

      if (parts.length < 2) {
        throw new Error(`Invalid GitHub URL: ${url}`);
      }

      const owner = parts[parts.length - 2];
      const repo = parts[parts.length - 1];

      if (!owner || !repo) {
        throw new Error(`Invalid GitHub URL: ${url}`);
      }

      return { owner, repo };
    } catch (error) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }
  }

  /**
   * Generate migration code using AI (GROQ)
   */
  private static async generateMigrationCode(
    originalContent: string,
    filePath: string,
    target: any,
  ): Promise<string> {
    const prompt = `
You are a senior software engineer. Migrate the following code to ${target.target || "latest version"}.

File: ${filePath}

Current Code:
\`\`\`
${originalContent.slice(0, 4000)}
\`\`\`

Requirements:
1. Update imports/exports to match the new version
2. Use modern syntax and best practices
3. Preserve all functionality
4. Handle any breaking changes

Return ONLY the migrated code, no explanations.
`;

    try {
      const response = await answerQuestion(prompt, "");
      return response;
    } catch (error) {
      console.error("AI code generation error:", error);
      return originalContent;
    }
  }

  /**
   * Apply migration via GitHub Pull Request
   */
  static async applyMigrationViaPR(
    planId: string,
    userId: string,
    repoUrl: string,
  ): Promise<GitHubMigrationResult> {
    try {
      // 1. Get the migration plan
      const plan = await db.migrationPlan.findFirst({
        where: { id: planId, userId },
        include: { project: true },
      });

      if (!plan) {
        return { success: false, message: "Migration plan not found" };
      }

      if (plan.status === "in_progress") {
        return { success: false, message: "Migration already in progress" };
      }

      // 2. Parse repository info
      const { owner, repo } = this.parseGitHubUrl(repoUrl);

      // 3. Create a new branch
      const safeName = plan.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const branchName = `migration/${safeName}-${Date.now()}`;

      // Get the default branch
      const repoData = await octokit.rest.repos.get({
        owner,
        repo,
      });
      const defaultBranch = repoData.data.default_branch;

      // Get the latest commit SHA
      const branchData = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch: defaultBranch,
      });
      const baseSha = branchData.data.commit.sha;

      // Create branch
      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      });

      // 4. Update status to in_progress
      await db.migrationPlan.update({
        where: { id: planId },
        data: {
          status: "in_progress",
          progress: 0,
          currentStep: 0,
          githubBranch: branchName,
        },
      });

      // 5. Process each migration step
      const steps = plan.steps as Array<{
        order: number;
        title: string;
        description: string;
        files: string[];
        commands: string[];
      }>;

      const changes: GitHubMigrationResult["changes"] = [];
      const totalSteps = steps?.length || 1;

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const progress = Math.round(((i + 1) / totalSteps) * 100);

        // Update progress
        await db.migrationPlan.update({
          where: { id: planId },
          data: {
            progress,
            currentStep: i + 1,
            totalSteps,
          },
        });

        // Process files in this step
        for (const filePath of step?.files || []) {
          try {
            let currentContent = "";
            let currentSha = "";

            // Try to get existing file
            try {
              const file = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: branchName,
              });

              if (
                file.data &&
                typeof file.data !== "string" &&
                "content" in file.data
              ) {
                currentContent = Buffer.from(
                  file.data.content,
                  "base64",
                ).toString("utf-8");
                currentSha = file.data.sha || "";
              }
            } catch (error: any) {
              // File doesn't exist - we'll create it
              if (error.status !== 404) {
                console.error(`Error getting ${filePath}:`, error);
              }
            }

            // Generate new content using AI
            const newContent = await this.generateMigrationCode(
              currentContent,
              filePath,
              plan.target as any,
            );

            if (newContent && newContent !== currentContent) {
              // Create or update file in the branch
              await octokit.rest.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: filePath,
                message: `Apply migration: ${plan.name} - ${filePath}`,
                content: Buffer.from(newContent).toString("base64"),
                branch: branchName,
                sha: currentSha || undefined,
              });

              changes.push({
                filePath,
                status: currentContent ? "modified" : "created",
              });
            }
          } catch (error) {
            console.error(`Error processing ${filePath}:`, error);
            changes.push({
              filePath,
              status: "error",
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }

        // Update progress after step
        await db.migrationPlan.update({
          where: { id: planId },
          data: { progress },
        });
      }

      // 6. Create Pull Request
      const prBody = `
## 🤖 Migration: ${plan.name}

### 📝 Description
${plan.description}

### 📊 Summary
- **Type:** ${plan.type}
- **Files Changed:** ${changes.filter((c) => c.status !== "error").length}
- **Estimated Time:** ${(plan as any).estimatedTime || "4-6 hours"}

### 📁 Changes
${changes.map((c) => `- \`${c.filePath}\`: ${c.status}`).join("\n")}

### ⚠️ Risks
${(plan.risks as any[])?.map((r) => `- **${r.level}:** ${r.description}`).join("\n")}

### 📦 Dependencies
${(plan.dependencies as any[])?.map((d) => `- \`${d.name}\`: ${d.from} → ${d.to}`).join("\n")}

### 🛠️ Steps
${steps.map((s) => `- ${s.order}. ${s.title}`).join("\n")}

---
*🤖 Generated by CodeForge Migration Assistant*
`;

      const pr = await octokit.rest.pulls.create({
        owner,
        repo,
        title: `🤖 Migration: ${plan.name}`,
        body: prBody,
        head: branchName,
        base: defaultBranch,
        draft: false,
      });

      // 7. Update plan with PR info
      await db.migrationPlan.update({
        where: { id: planId },
        data: {
          status: "completed",
          progress: 100,
          githubPrNumber: pr.data.number,
          githubPrUrl: pr.data.html_url,
          rollback: {
            branchName,
            prNumber: pr.data.number,
            changes,
            appliedAt: new Date().toISOString(),
          },
        },
      });

      return {
        success: true,
        message: `Migration PR created successfully!`,
        prUrl: pr.data.html_url,
        branchName,
        prNumber: pr.data.number,
        changes,
      };
    } catch (error) {
      console.error("GitHub migration error:", error);

      // Update status to failed
      await db.migrationPlan.update({
        where: { id: planId },
        data: {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to apply migration",
      };
    }
  }

  /**
   * Rollback migration (close PR and delete branch)
   */
  static async rollbackViaGitHub(
    planId: string,
    userId: string,
    repoUrl: string,
  ): Promise<RollbackResult> {
    try {
      // 1. Get the migration plan
      const plan = await db.migrationPlan.findFirst({
        where: { id: planId, userId },
      });

      if (!plan) {
        return { success: false, message: "Plan not found" };
      }

      if (plan.status !== "completed") {
        return {
          success: false,
          message: "Only completed migrations can be rolled back",
        };
      }

      const rollbackData = plan.rollback as any;
      if (!rollbackData?.prNumber) {
        return { success: false, message: "No PR found to rollback" };
      }

      // 2. Parse repository info
      const { owner, repo } = this.parseGitHubUrl(repoUrl);

      let prClosed = false;
      let branchDeleted = false;

      // 3. Close the PR
      try {
        await octokit.rest.pulls.update({
          owner,
          repo,
          pull_number: rollbackData.prNumber,
          state: "closed",
        });
        prClosed = true;
      } catch (error) {
        console.error("Failed to close PR:", error);
      }

      // 4. Delete the branch
      try {
        await octokit.rest.git.deleteRef({
          owner,
          repo,
          ref: `heads/${rollbackData.branchName}`,
        });
        branchDeleted = true;
      } catch (error) {
        console.error("Failed to delete branch:", error);
      }

      // 5. Update plan status
      await db.migrationPlan.update({
        where: { id: planId },
        data: {
          status: "rolled_back",
          rollback: {
            ...rollbackData,
            rolledBackAt: new Date().toISOString(),
            prClosed,
            branchDeleted,
          },
          githubPrNumber: null,
          githubPrUrl: null,
          githubBranch: null,
        },
      });

      return {
        success: true,
        message: `Rollback successful: PR ${prClosed ? "closed" : "not closed"}, Branch ${branchDeleted ? "deleted" : "not deleted"}`,
        prClosed,
        branchDeleted,
      };
    } catch (error) {
      console.error("Rollback error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to rollback",
      };
    }
  }

  /**
   * Get migration progress
   */
  static async getProgress(planId: string): Promise<{
    status: string;
    progress: number;
    currentStep: number;
    totalSteps: number;
    prUrl?: string;
    prNumber?: number;
  }> {
    const plan = await db.migrationPlan.findUnique({
      where: { id: planId },
      select: {
        status: true,
        progress: true,
        currentStep: true,
        totalSteps: true,
        githubPrUrl: true,
        githubPrNumber: true,
      },
    });

    if (!plan) {
      return {
        status: "not_found",
        progress: 0,
        currentStep: 0,
        totalSteps: 0,
      };
    }

    return {
      status: plan.status,
      progress: plan.progress || 0,
      currentStep: plan.currentStep || 0,
      totalSteps: plan.totalSteps || 0,
      prUrl: plan.githubPrUrl || undefined,
      prNumber: plan.githubPrNumber || undefined,
    };
  }
}
