// import { db } from "@/server/db";
// import { deploymentScore } from "./deployment-score";

import { db } from "@/server/db";
import { deploymentScore } from "./deployment-score";
import { answerQuestion } from "../groq";

// export async function analyzeDeployment(projectId: string) {
//   const files = await db.sourceCodeEmbedding.findMany({
//     where: {
//       projectId,
//     },
//     select: {
//       fileName: true,
//       sourceCode: true,
//     },
//   });

//   const names = files.map((f) => f.fileName.toLowerCase());

//   const stack: string[] = [];
//   const issues: string[] = [];
//   const recommendations: string[] = [];

//   if (names.some((f) => f.includes("prisma"))) {
//     stack.push("Prisma");
//   }
//   if (names.some((f) => f.includes("tailwind"))) {
//     stack.push("Tailwind");
//   }
//   if (files.some((f) => f.sourceCode.includes("@clerk"))) {
//     stack.push("Clerk");
//   }

//   if (files.some((f) => f.sourceCode.includes("groq"))) {
//     stack.push("Groq");
//   }

//   if (files.some((f) => f.sourceCode.includes("next"))) {
//     stack.push("NextJS");
//   }

//   if (!names.includes("dockerfile")) {
//     issues.push("Missing Dockerfile");
//     recommendations.push("Create Dockerfile");
//   }

//   if (!names.includes(".env.example")) {
//     issues.push("Missing .env.example");
//     recommendations.push("Add .env.example");
//   }

//   if (!names.some((f) => f.includes(".github/workflows"))) {
//     issues.push("No CI/CD workflow");
//     recommendations.push("Add Github Actions");
//   }

//   if (!names.includes("readme.md")) {
//     issues.push("README missing");
//     recommendations.push("Add README");
//   }

//   const score = deploymentScore(issues);

//   return { score, stack, issues, recommendations };
// }

export async function analyzeDeploymentHeuristic(projectId: string) {
  const files = await db.sourceCodeEmbedding.findMany({
    where: { projectId },
    select: { fileName: true, sourceCode: true },
  });

  const names = files.map((f) => f.fileName.toLowerCase());

  const stack: string[] = [];
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (names.some((f) => f.includes("prisma"))) stack.push("Prisma");
  if (names.some((f) => f.includes("tailwind"))) stack.push("Tailwind");
  if (files.some((f) => f.sourceCode.includes("@clerk"))) stack.push("Clerk");
  if (files.some((f) => f.sourceCode.includes("groq"))) stack.push("Groq");
  if (files.some((f) => f.sourceCode.includes("next"))) stack.push("NextJS");

  if (!names.includes("dockerfile")) {
    issues.push("Missing Dockerfile");
    recommendations.push("Create Dockerfile");
  }
  if (!names.includes(".env.example")) {
    issues.push("Missing .env.example");
    recommendations.push("Add .env.example");
  }
  if (!names.some((f) => f.includes(".github/workflows"))) {
    issues.push("No CI/CD workflow");
    recommendations.push("Add GitHub Actions");
  }
  if (!names.includes("readme.md")) {
    issues.push("README missing");
    recommendations.push("Add README");
  }

  const score = deploymentScore(issues);
  return { score, stack, issues, recommendations };
}

export async function analyzeDeploymentAI(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      sourceCodeEmbeddings: { take: 30 },
      commits: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) throw new Error(`Project not found!`);

  const projectData = {
    projectName: project.name,
    githubUrl: project.githubUrl,
    fileCount: project.sourceCodeEmbeddings.length,
    directoryStructure: project.sourceCodeEmbeddings.map((e) => e.fileName),
    commitHistory: project.commits.map((c) => c.commitMessage),
  };

  const prompt = `
You are a senior DevOps expert. Analyze the following project for deployment readiness and return a JSON object with the exact structure below. Only output valid JSON, no extra text.

Project Name: ${projectData.projectName}
GitHub URL: ${projectData.githubUrl}
Total Files: ${projectData.fileCount}
Directory Structure (first 20): ${projectData.directoryStructure.slice(0, 20).join(", ")}
Recent Commits (first 5): ${projectData.commitHistory.slice(0, 5).join(" | ")}

Required JSON structure:
{
  "summary": "string (overall assessment)",
  "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
  "score": number (0-100),
  "performanceScore": number (0-100),
  "securityScore": number (0-100),
  "maintainabilityScore": number (0-100),
  "confidence": number (0-100),
  "issues": ["string list of issues"],
  "recommendations": ["string list of recommendations"],
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "priority": "HIGH | MEDIUM | LOW",
      "effort": "HIGH | MEDIUM | LOW"
    }
  ],
  "stack": ["string list of technologies"],
  "strengths": ["string list"],
  "weaknesses": ["string list"]
}

Provide a thorough analysis.
`;

  try {
    const response = await answerQuestion(prompt, "");
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis.summary || typeof analysis.score !== "number") {
      throw new Error("Invalid analysis structure");
    }

    const defaults = {
      riskLevel: "MEDIUM",
      performanceScore: 0,
      securityScore: 0,
      maintainabilityScore: 0,
      confidence: 0,
      issues: [],
      recommendations: [],
      suggestions: [],
      stack: [],
      strengths: [],
      weaknesses: [],
    };
    return { ...defaults, ...analysis };
  } catch (error) {
    console.warn("GROQ AI analysis failed, falling back to heuristic", error);
    const heuristic = await analyzeDeploymentHeuristic(projectId);
    return {
      summary: "Heuristic-based analysis (AI unavailable)",
      riskLevel:
        heuristic.score > 70 ? "LOW" : heuristic.score > 40 ? "MEDIUM" : "HIGH",
      score: heuristic.score,
      performanceScore: Math.round(heuristic.score * 0.8),
      securityScore: Math.round(heuristic.score * 0.7),
      maintainabilityScore: Math.round(heuristic.score * 0.9),
      confidence: 0,
      issues: heuristic.issues,
      recommendations: heuristic.recommendations,
      suggestions: heuristic.recommendations.map((rec) => ({
        title: rec,
        description: rec,
        priority: "MEDIUM",
        effort: "MEDIUM",
      })),
      stack: heuristic.stack,
      strengths: ["Basic structure exists"],
      weaknesses: heuristic.issues,
    };
  }
}

export async function analyzeDeployment(projectId: string) {
  return await analyzeDeploymentAI(projectId);
}
