import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { analyzeDeployment } from "@/lib/ai/utils/deployment-analyzer";
import { CACHE_TTL, cacheKeys } from "@/lib/redis/client";
import { CacheService } from "@/lib/services/cache-service";

export const deploymentRouter = createTRPCRouter({
  // Run AI analysis and update DeployReport
  analyze: protectedProcedure
    .input(
      z.object({ projectId: z.string(), forceRefresh: z.boolean().optional() }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, forceRefresh = false } = input;
      const userId = ctx.user.userId!;

      // Check if user has access to this project
      const project = await ctx.db.project.findFirst({
        where: {
          id: projectId,
          userToProjects: {
            some: {
              userId: userId,
            },
          },
        },
        include: {
          commits: { take: 10, orderBy: { createdAt: "desc" } },
          sourceCodeEmbeddings: { take: 20 },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const cacheKey = cacheKeys.deployment(projectId);

      // Get analysis from cache or run AI
      const analysis = await CacheService.getOrSet(
        cacheKey,
        async () => {
          const projectData = {
            projectName: project.name,
            githubUrl: project.githubUrl,
            fileCount: project.sourceCodeEmbeddings?.length || 0,
            directoryStructure:
              project.sourceCodeEmbeddings?.map((e) => e.fileName) || [],
            commitHistory: project.commits?.map((c) => c.commitMessage) || [],
            sourceCodeSnippets:
              project.sourceCodeEmbeddings?.map((e) =>
                e.sourceCode.slice(0, 500),
              ) || [],
          };

          return await analyzeDeployment(projectId);
        },
        {
          ttl: CACHE_TTL.DEPLOYMENT,
          forceRefresh,
        },
      );

      // Calculate overall score (weighted)
      const overallScore = Math.round(
        analysis.score * 0.4 +
          (analysis.securityScore || 0) * 0.3 +
          (analysis.performanceScore || 0) * 0.2 +
          (analysis.maintainabilityScore || 0) * 0.1,
      );

      // Upsert DeployReport
      const report = await ctx.db.deployReport.upsert({
        where: { projectId },
        update: {
          score: overallScore,
          stack: analysis.stack || [],
          issues: analysis.issues || [],
          recommendations: analysis.recommendations || [],
          aiAnalysis: analysis as any,
          aiSummary: analysis.summary,
          aiConfidence: analysis.confidence ? analysis.confidence / 100 : null,
          aiSuggestions: analysis.suggestions as any,
          riskLevel: analysis.riskLevel,
          performanceScore: analysis.performanceScore || 0,
          securityScore: analysis.securityScore || 0,
          maintainabilityScore: analysis.maintainabilityScore || 0,
        },
        create: {
          projectId,
          score: overallScore,
          stack: analysis.stack || [],
          issues: analysis.issues || [],
          recommendations: analysis.recommendations || [],
          aiAnalysis: analysis as any,
          aiSummary: analysis.summary,
          aiConfidence: analysis.confidence ? analysis.confidence / 100 : null,
          aiSuggestions: analysis.suggestions as any,
          riskLevel: analysis.riskLevel,
          performanceScore: analysis.performanceScore || 0,
          securityScore: analysis.securityScore || 0,
          maintainabilityScore: analysis.maintainabilityScore || 0,
        },
      });

      await CacheService.invalidate(cacheKeys.allDeploymentReports(projectId));

      return { ...report, analysis };
    }),

  // Get current report
  getReport: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      const project = await ctx.db.project.findFirst({
        where: {
          id: projectId,
          userToProjects: {
            some: {
              userId: userId,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const cacheKey = `deployment:${projectId}:current`;

      return await CacheService.getOrSet(
        cacheKey,
        async () => {
          return ctx.db.deployReport.findUnique({ where: { projectId } });
        },
        { ttl: CACHE_TTL.DEPLOYMENT },
      );
    }),

  // Save a named report snapshot
  saveReport: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string().min(1).max(100),
        data: z.any(),
        metadata: z.any().optional(),
        isDefault: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, name, data, metadata, isDefault } = input;
      const userId = ctx.user.userId!;

      console.log("🔵 Save Report Called:", { projectId, name, userId });

      try {
        // First check if user has access to this project
        const project = await ctx.db.project.findFirst({
          where: {
            id: projectId,
            userToProjects: {
              some: {
                userId: userId,
              },
            },
          },
        });

        if (!project) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        // Check if report already exists
        const existing = await ctx.db.deploymentReport.findFirst({
          where: {
            projectId: projectId,
            name: name,
            userId: userId,
          },
        });

        let result;

        if (existing) {
          // Update existing
          result = await ctx.db.deploymentReport.update({
            where: { id: existing.id },
            data: {
              data: data,
              metadata: metadata || null,
              isDefault: isDefault || false,
            },
          });
        } else {
          if (isDefault) {
            await ctx.db.deploymentReport.updateMany({
              where: {
                projectId: projectId,
                userId: userId,
                isDefault: true,
              },
              data: { isDefault: false },
            });
          }

          result = await ctx.db.deploymentReport.create({
            data: {
              projectId: projectId,
              name: name,
              data: data,
              metadata: metadata || null,
              isDefault: isDefault || false,
              userId: userId,
            },
          });
        }

        // Invalidate caches
        await CacheService.invalidate(
          cacheKeys.allDeploymentReports(projectId),
        );
        await CacheService.invalidate(`deployment:${projectId}:current`);

        if (existing) {
          await CacheService.invalidate(
            cacheKeys.deploymentReport(projectId, existing.id),
          );
        }

        return result;
      } catch (error) {
        console.error("❌ Save Report Error:", error);
        throw error;
      }
    }),

  // Get all saved reports
  getAllReports: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      // Check access
      const project = await ctx.db.project.findFirst({
        where: {
          id: projectId,
          userToProjects: {
            some: {
              userId: userId,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const cacheKey = cacheKeys.allDeploymentReports(projectId);
      return await CacheService.getOrSet(
        cacheKey,
        async () => {
          return ctx.db.deploymentReport.findMany({
            where: {
              projectId: projectId,
              userId: userId,
            },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              name: true,
              createdAt: true,
              updatedAt: true,
              isDefault: true,
              metadata: true,
            },
          });
        },
        { ttl: CACHE_TTL.REPORTS },
      );
    }),

  // Get a single saved report by id
  getOneReport: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.userId!;

      const report = await ctx.db.deploymentReport.findFirst({
        where: {
          id: id,
          userId: userId,
        },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      const cacheKey = cacheKeys.deploymentReport(report.projectId, id);

      return await CacheService.getOrSet(cacheKey, async () => report, {
        ttl: CACHE_TTL.REPORTS,
      });
    }),

  // Get default report
  getDefaultReport: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      const cacheKey = `deployment:${projectId}:reports:default`;

      return await CacheService.getOrSet(
        cacheKey,
        async () => {
          return ctx.db.deploymentReport.findFirst({
            where: {
              projectId: projectId,
              userId: userId,
              isDefault: true,
            },
          });
        },
        { ttl: CACHE_TTL.REPORTS },
      );
    }),

  // Delete a saved report
  deleteReport: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.userId!;

      const report = await ctx.db.deploymentReport.findFirst({
        where: {
          id: id,
          userId: userId,
        },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Report not found" });
      }

      const result = await ctx.db.deploymentReport.delete({
        where: { id: id },
      });

      // Invalidate caches
      await CacheService.invalidate(
        cacheKeys.allDeploymentReports(report.projectId),
      );
      await CacheService.invalidate(`deployment:${report.projectId}:current`);
      await CacheService.invalidate(
        cacheKeys.deploymentReport(report.projectId, id),
      );

      return result;
    }),
});
