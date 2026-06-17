"use server";

import { askQuestion } from "@/lib/ai/ask-questions";

export async function askCodebaseQuestion(question: string, projectId: string) {
  return askQuestion(question, projectId);
}
