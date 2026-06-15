import OpenAI from "openai";
import { protectRequest } from "../security/arcjet/arcjet-protect";
import { Document } from "@langchain/core/documents";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const aiSummariseCommit = async (diff: string) => {
  // await protectRequest();
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a senior software engineer reviewing git commits.",
        },
        {
          role: "user",
          content: `
Analyze this git diff:

${diff}

Provide:

Summary:
Files Changed:
Purpose:
Impact:
Risk Level:
Potential Issues:
`,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content ?? "";
  } catch (error) {
    console.error(error);
    return "AI summary unavailable";
  }
};

export async function summariseCode(doc: Document) {
  // await protectRequest();

  try {
    const code = doc.pageContent.slice(0, 10000);

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are a staff software engineer creating codebase documentation.",
        },
        {
          role: "user",
          content: `
Analyze the following source code file and generate a concise summary optimized for semantic search and retrieval.

File Name:
${doc.metadata.source}

Code:
\`\`\`
${code}
\`\`\`

Return in this format:

Purpose:
Main Responsibilities:
Key Functions:
Key Dependencies:
Important Business Logic:
Search Keywords:

Keep the response under 200 words.
`,
        },
      ],
      temperature: 0.2,
    });

    return response.choices[0]?.message?.content ?? "";
  } catch (error) {
    console.error(error);
    return "Code summary unavailable";
  }
}

export async function answerQuestion(question: string, context: string) {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a senior software engineer.

Answer questions about the codebase.

Only use information present in the context.

Mention file names whenever possible.

If the context does not contain the answer,
say that the information is unavailable.
`,
      },
      {
        role: "user",
        content: `
CONTEXT:

${context}

QUESTION:

${question}
`,
      },
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
