import OpenAI from "openai";
import { protectRequest } from "../security/arcjet/arcjet-protect";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export const aiSummariseCommit = async (diff: string) => {
  await protectRequest();
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
