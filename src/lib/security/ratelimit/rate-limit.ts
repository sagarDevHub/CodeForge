import { Redis } from "@upstash/redis";

import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

export const pullCommitsRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export const createProjectRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export const groqLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 h"),
});
