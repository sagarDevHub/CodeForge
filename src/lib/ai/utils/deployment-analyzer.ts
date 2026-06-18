import { db } from "@/server/db";
import { deploymentScore } from "./deployment-score";

export async function analyzeDeployment(projectId: string) {
  const files = await db.sourceCodeEmbedding.findMany({
    where: {
      projectId,
    },
    select: {
      fileName: true,
      sourceCode: true,
    },
  });

  const names = files.map((f) => f.fileName.toLowerCase());

  const stack: string[] = [];
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (names.some((f) => f.includes("prisma"))) {
    stack.push("Prisma");
  }
  if (names.some((f) => f.includes("tailwind"))) {
    stack.push("Tailwind");
  }
  if (files.some((f) => f.sourceCode.includes("@clerk"))) {
    stack.push("Clerk");
  }

  if (files.some((f) => f.sourceCode.includes("groq"))) {
    stack.push("Groq");
  }

  if (files.some((f) => f.sourceCode.includes("next"))) {
    stack.push("NextJS");
  }

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
    recommendations.push("Add Github Actions");
  }

  if (!names.includes("readme.md")) {
    issues.push("README missing");
    recommendations.push("Add README");
  }

  const score = deploymentScore(issues);

  return { score, stack, issues, recommendations };
}
