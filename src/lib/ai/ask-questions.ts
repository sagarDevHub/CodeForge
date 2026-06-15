import { answerQuestion } from "./groq";
import { generateEmbeddings } from "./hf-embeddings";
import { db } from "@/server/db";

export async function askQuestion(question: string, projectId: string) {
  const queryVector = await generateEmbeddings(question);

  const vectorQuery = `[${queryVector.join(",")}]`;

  const docs = await db.$queryRaw<
    {
      fileName: string;
      summary: string;
      sourceCode: string;
      similarity: number;
    }[]
  >`
    SELECT
      "fileName",
      "summary",
      "sourceCode",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) as similarity
    FROM "SourceCodeEmbedding"
    WHERE "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `;

  const context = docs
    .map(
      (doc) => `
FILE: ${doc.fileName}

SUMMARY:
${doc.summary}
`,
    )
    .join("\n\n");

  const output = await answerQuestion(question, context);
  return {
    output,
    filesReferences: docs.map((doc) => ({
      fileName: doc.fileName,
      summary: doc.summary,
      sourceCode: doc.sourceCode,
    })),
  };
}
