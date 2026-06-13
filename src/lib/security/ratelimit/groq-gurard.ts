import { TRPCError } from "@trpc/server";
import { groqLimiter } from "./rate-limit";

export async function checkGroqLimit(userId: string) {
  const { success } = await groqLimiter.limit(`groq:${userId}`);

  if (!success) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "AI quota exceeded. Please try again later.",
    });
  }
}
