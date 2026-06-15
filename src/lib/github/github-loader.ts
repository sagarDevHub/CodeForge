import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { summariseCode } from "../ai/groq";
import { generateEmbeddings } from "../ai/hf-embeddings";
import { db } from "@/server/db";

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: "main",
    ignoreFiles: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.lock",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ],
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken);
  const allEmbeddings = await generateEmbeddingsForDocs(docs, projectId);

  await Promise.allSettled(
    allEmbeddings.map(async (embedding, idx) => {
      console.log(`Processing ${idx} of ${allEmbeddings.length}`);

      if (!embedding) return;
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });
      await db.$executeRawUnsafe(`
  UPDATE "SourceCodeEmbedding"
  SET "summaryEmbedding" = '[${embedding.embedding.join(",")}]'::vector
  WHERE "id" = '${sourceCodeEmbedding.id}'
`);
    }),
  );
};

const generateEmbeddingsForDocs = async (
  docs: Document[],
  projectId: string,
) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariseCode(doc);
      const embedding = await generateEmbeddings(summary);
      return {
        projectId,
        fileName: doc.metadata.source,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        summary,
        embedding,
      };
    }),
  );
};
