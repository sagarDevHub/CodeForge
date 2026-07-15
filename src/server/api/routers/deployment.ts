import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { analyzeDeployment } from "@/lib/ai/utils/deployment-analyzer";

export const deploymentRouter = createTRPCRouter({
  // Run AI analysis and update DeployReport
  analyze: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;
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
      });

      if (!project) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Run AI analysis
      const analysis = await analyzeDeployment(projectId);

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

      return ctx.db.deployReport.findUnique({ where: { projectId } });
    }),

  // Save a named report snapshot
  // In src/server/api/routers/deployment.ts
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

        console.log("📁 Project found:", project ? "Yes" : "No");

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

        console.log("📄 Existing report:", existing ? "Yes" : "No");

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
          console.log("✅ Report Updated:", result.id);
        } else {
          // Create new
          // If setting as default, unset others first
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
          console.log("✅ Report Created:", result.id);
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

      return report;
    }),

  // Get default report
  getDefaultReport: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      return ctx.db.deploymentReport.findFirst({
        where: {
          projectId: projectId,
          userId: userId,
          isDefault: true,
        },
      });
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

      return ctx.db.deploymentReport.delete({ where: { id: id } });
    }),
});
