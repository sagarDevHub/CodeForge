import { auth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { pullCommitsRateLimit } from "./rate-limit";

export async function checkPullCommitLimit() {
  const { userId } = await auth();
  if (!userId) {
    throw new TRPCError({
      code: `UNAUTHORIZED`,
    });
  }

  const { success } = await pullCommitsRateLimit.limit(userId);
  if (!success) {
    throw new TRPCError({
      code: `TOO_MANY_REQUESTS`,
      message: `Please wait before pulling commits again`,
    });
  }
}
