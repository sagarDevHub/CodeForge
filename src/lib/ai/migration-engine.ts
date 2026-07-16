import { db } from "@/server/db";
import { answerQuestion } from "./groq";

export interface MigrationAnalysis {
  summary: string;
  type: "framework" | "language" | "architecture" | "refactor";
  steps: Array<{
    order: number;
    title: string;
    description: string;
    files: string[];
    commands: string[];
  }>;
  risks: Array<{
    level: "low" | "medium" | "high" | "critical";
    description: string;
    mitigation: string;
  }>;
  estimatedTime: string;
  files: string[];
  dependencies: Array<{
    name: string;
    from: string;
    to: string;
    reason: string;
  }>;
}

export interface CodeRefactorSuggestion {
  filePath: string;
  original: string;
  proposed: string;
  summary: string;
  type: "refactor" | "optimize" | "fix";
  confidence: number;
}

function detectTechStack(files: any[]): string {
  const techs: string[] = [];
  const content = files.map((f) => f.code || "").join(" ");

  if (content.includes("import React") || content.includes("from 'react'")) {
    techs.push("React");
  }
  if (content.includes("next") || content.includes("Next.js")) {
    techs.push("Next.js");
  }
  if (content.includes("prisma")) {
    techs.push("Prisma");
  }
  if (content.includes("@clerk")) {
    techs.push("Clerk");
  }
  if (content.includes("tailwind")) {
    techs.push("Tailwind");
  }
  if (content.includes("express")) {
    techs.push("Express");
  }
  if (
    content.includes("typescript") ||
    content.includes(".tsx") ||
    content.includes(".ts")
  ) {
    techs.push("TypeScript");
  }

  return techs.join(", ") || "Unknown";
}

export async function analyzeMigration(
  projectId: string,
  target: string,
  type: string,
): Promise<MigrationAnalysis> {
  // Get project structure
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sourceCodeEmbeddings: { take: 50 },
      commits: { take: 20, orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) throw new Error("Project not found");

  const files = project.sourceCodeEmbeddings.map((f) => ({
    name: f.fileName,
    summary: f.summary,
    code: f.sourceCode.slice(0, 500),
  }));

  const techStack = detectTechStack(files);

  const prompt = `
You are a senior software architect specializing in code migrations.

Project: ${project.name}
Target Migration: ${target}
Migration Type: ${type}

Current Codebase Analysis:
- Total Files: ${files.length}
- Technologies Detected: ${techStack}
- Key Files:
${files
  .slice(0, 10)
  .map((f) => `- ${f.name}: ${f.summary}`)
  .join("\n")}

Recent Commits:
${project.commits
  .slice(0, 5)
  .map((c) => `- ${c.commitMessage}`)
  .join("\n")}

Generate a comprehensive migration plan with:

1. **Summary**: Brief overview of the migration
2. **Steps**: Ordered list of migration steps with file paths and commands
3. **Risks**: Identify potential risks and mitigation strategies
4. **Estimated Time**: Time estimate for completion
5. **Files**: List of files that will be affected
6. **Dependencies**: Packages that need to be updated

IMPORTANT: Return ONLY valid JSON with the following structure:
{
  "summary": "string",
  "steps": [
    {
      "order": 1,
      "title": "string",
      "description": "string",
      "files": ["file1.ts", "file2.ts"],
      "commands": ["npm install something", "npx some-command"]
    }
  ],
  "risks": [
    {
      "level": "low|medium|high|critical",
      "description": "string",
      "mitigation": "string"
    }
  ],
  "estimatedTime": "2-3 hours",
  "files": ["file1.ts", "file2.ts"],
  "dependencies": [
    {
      "name": "package-name",
      "from": "1.0.0",
      "to": "2.0.0",
      "reason": "Upgrade reason"
    }
  ]
}
`;

  try {
    const response = await answerQuestion(prompt, "");
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const result = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!result.summary || !result.steps || !result.risks) {
      throw new Error("Invalid migration analysis structure");
    }

    return result;
  } catch (error) {
    console.error("Migration analysis error:", error);
    // Return fallback
    return {
      summary: `Migration to ${target} requires careful planning. Review the codebase and follow best practices.`,
      type: type as any,
      steps: [
        {
          order: 1,
          title: "Review current codebase",
          description: "Analyze existing code structure and dependencies",
          files: ["package.json", "tsconfig.json"],
          commands: ["npm outdated", "npm list --depth=0"],
        },
        {
          order: 2,
          title: "Update dependencies",
          description: "Update packages to latest versions",
          files: ["package.json"],
          commands: ["npm update", "npm install"],
        },
      ],
      risks: [
        {
          level: "medium",
          description: "Breaking changes in dependencies",
          mitigation: "Review changelogs and test thoroughly",
        },
      ],
      estimatedTime: "4-6 hours",
      files: [],
      dependencies: [],
    };
  }
}

export async function generateMigrationDiff(
  filePath: string,
  original: string,
  target: string,
): Promise<string> {
  const prompt = `
Convert the following code from current version to ${target}.

File: ${filePath}

Current Code:
\`\`\`
${original}
\`\`\`

Generate the updated code with proper syntax and best practices.

Return ONLY the updated code, no explanations.
`;

  try {
    const response = await answerQuestion(prompt, "");
    return response;
  } catch (error) {
    console.error("Diff generation error:", error);
    return original;
  }
}

export async function suggestRefactors(
  projectId: string,
  filePath?: string,
): Promise<CodeRefactorSuggestion[]> {
  // Get files from project
  const files = await db.sourceCodeEmbedding.findMany({
    where: {
      projectId,
      ...(filePath ? { fileName: filePath } : {}),
    },
    take: 20,
  });

  const suggestions: CodeRefactorSuggestion[] = [];

  for (const file of files) {
    const prompt = `
Analyze this code and suggest improvements:

File: ${file.fileName}
Code:
\`\`\`
${file.sourceCode.slice(0, 3000)}
\`\`\`

Suggest specific refactoring improvements for:
1. Code readability
2. Performance optimization
3. Best practices
4. Security

Return JSON with:
{
  "summary": "brief description of changes",
  "type": "refactor|optimize|fix",
  "confidence": 0-100
}
`;

    try {
      const response = await answerQuestion(prompt, "");
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        suggestions.push({
          filePath: file.fileName,
          original: file.sourceCode.slice(0, 500),
          proposed: file.sourceCode.slice(0, 500), // Will be replaced with actual refactored code
          summary: result.summary || "Improve code quality",
          type: result.type || "refactor",
          confidence: result.confidence || 50,
        });
      }
    } catch (error) {
      console.error(`Refactor suggestion error for ${file.fileName}:`, error);
    }
  }

  return suggestions;
}
