import { db } from "@/server/db";
import { indexGithubRepo } from "../github/github-loader";
import { pullCommits } from "../github/github";

export async function processProjectInBackground(
  projectId: string,
  githubUrl: string,
  userId: string,
  githubToken?: string,
) {
  try {
    await db.project.update({
      where: { id: projectId },
      data: {
        status: "processing",
        statusMessage: "Cloning repository...",
        progress: 10,
      },
    });

    await db.project.update({
      where: { id: projectId },
      data: {
        statusMessage: "Indexing codebase...",
        progress: 40,
      },
    });

    await indexGithubRepo(projectId, githubUrl, githubToken);

    await db.project.update({
      where: { id: projectId },
      data: {
        statusMessage: "Analysing commits...",
        progress: 70,
      },
    });

    await pullCommits(projectId, userId);

    await db.project.update({
      where: { id: projectId },
      data: {
        status: "completed",
        statusMessage: "Project ready!",
        progress: 100,
      },
    });
  } catch (error) {
    console.error("Error processing project:", error);
    await db.project.update({
      where: { id: projectId },
      data: {
        status: "failed",
        statusMessage: error instanceof Error ? error.message : "Unknown error",
        progress: 0,
      },
    });
  }
}
