import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export { redis };

export const cacheKeys = {
  architecture: (projectId: string) => `architecture:${projectId}`,
  deployment: (projectId: string) => `deployment:${projectId}`,
  deploymentReport: (projectId: string, reportId: string) =>
    `deployment:${projectId}:report${reportId}`,
  allDeploymentReports: (projectId: string) =>
    `deployment:${projectId}:reports:all`,
  projectMetrics: (projectId: string) => `project:${projectId}:metrics`,
};

export const CACHE_TTL = {
  ARCHITECTURE: 3600,
  DEPLOYMENT: 1800,
  REPORTS: 300,
  METRICS: 600,
};
