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
  migrationPlan: (planId: string) => `migration:plan:${planId}`,
  migrationAnalysis: (projectId: string, type: string) =>
    `migration:analysis:${projectId}:${type}`,
  migrationCode: (projectId: string) => `migration:code:${projectId}`,
};

export const CACHE_TTL = {
  ARCHITECTURE: 3600,
  DEPLOYMENT: 1800,
  REPORTS: 300,
  METRICS: 600,
  MIGRATION_PLAN: 86400,
  MIGRATION_ANALYSIS: 3600,
  MIGRATION_CODE: 1800,
};
