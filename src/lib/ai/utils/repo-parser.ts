import { db } from "@/server/db";

export async function getCleanRepoTree(projectId: string) {
  const files = await db.sourceCodeEmbedding.findMany({
    where: {
      projectId,
    },
    select: { fileName: true, summary: true },
  });

  const treeMap = files
    .map((f) => `- ${f.fileName}: ${f.summary.slice(0, 80)}...`)
    .join("\n");
  return treeMap;
}
