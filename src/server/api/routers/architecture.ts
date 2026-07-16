import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generateArchitectureGraph } from "@/lib/ai/groq";
import { CacheService } from "@/lib/services/cache-service";
import { cacheKeys, CACHE_TTL } from "@/lib/redis/client";

export const architectureRouter = createTRPCRouter({
  // Get architecture with caching
  getArchitecture: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      // Check access
      const access = await ctx.db.userToProject.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });

      if (!access) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const cacheKey = cacheKeys.architecture(projectId);

      // Get from cache or generate
      return await CacheService.getOrSet(
        cacheKey,
        async () => {
          // Get project data
          const project = await ctx.db.project.findUnique({
            where: { id: projectId },
            include: {
              sourceCodeEmbeddings: true,
              commits: { take: 10, orderBy: { createdAt: "desc" } },
            },
          });

          if (!project) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Project not found",
            });
          }

          // If no embeddings, generate architecture from repo tree
          if (project.sourceCodeEmbeddings.length === 0) {
            return await generateArchitectureGraph(projectId);
          }

          // Build architecture data from embeddings
          const nodes = project.sourceCodeEmbeddings.map((file) => ({
            id: file.fileName.replace(/[^a-zA-Z0-9]/g, "_"),
            label: file.fileName.split("/").pop() || file.fileName,
            type: file.fileName.includes(".") ? "file" : "folder",
            metadata: {
              summary: file.summary,
              lineCount: file.sourceCode.split("\n").length,
            },
          }));

          const edges: Array<{ source: string; target: string; type: string }> =
            [];

          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const sourceLabel = nodes[i]?.label || "";
              const targetLabel = nodes[j]?.label || "";
              const sourceParts = sourceLabel.split("/");
              const targetParts = targetLabel.split("/");

              // Get folder paths (remove the last part which is the filename)
              const sourceFolder = sourceParts.slice(0, -1).join("/");
              const targetFolder = targetParts.slice(0, -1).join("/");

              if (
                sourceFolder &&
                targetFolder &&
                sourceFolder === targetFolder
              ) {
                edges.push({
                  source: nodes[i]?.id || "",
                  target: nodes[j]?.id || "",
                  type: "dependency",
                });
              }
            }
          }

          return {
            nodes,
            edges: edges.slice(0, 50),
            metrics: {
              totalModules: nodes.filter((n) => n.type === "folder").length,
              totalFiles: nodes.filter((n) => n.type === "file").length,
              complexity: Math.min(nodes.length * 2, 100),
              dependencies: edges.length,
            },
          };
        },
        {
          ttl: CACHE_TTL.ARCHITECTURE,
          forceRefresh: false,
        },
      );
    }),

  // Invalidate architecture cache
  invalidateArchitecture: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      const access = await ctx.db.userToProject.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });

      if (!access) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await CacheService.invalidate(cacheKeys.architecture(projectId));
      return { success: true };
    }),

  //  Get all blueprints
  getAllBlueprints: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      const access = await ctx.db.userToProject.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });

      if (!access) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return ctx.db.architectureBlueprint.findMany({
        where: { projectId, userId },
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

  //  Get one blueprint
  getOneBlueprint: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.userId!;

      const blueprint = await ctx.db.architectureBlueprint.findFirst({
        where: { id, userId },
      });

      if (!blueprint) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blueprint not found",
        });
      }

      return blueprint;
    }),

  //  Save blueprint
  saveBlueprint: protectedProcedure
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

      // Check access
      const access = await ctx.db.userToProject.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });

      if (!access) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // If setting as default, unset others
      if (isDefault) {
        await ctx.db.architectureBlueprint.updateMany({
          where: { projectId, userId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Check if blueprint with same name exists
      const existing = await ctx.db.architectureBlueprint.findUnique({
        where: { projectId_name: { projectId, name } },
      });

      if (existing) {
        return ctx.db.architectureBlueprint.update({
          where: { id: existing.id },
          data: {
            data: data as any,
            metadata: metadata || null,
            isDefault: isDefault || false,
          },
        });
      }

      return ctx.db.architectureBlueprint.create({
        data: {
          projectId,
          name,
          data: data as any,
          metadata: metadata || null,
          isDefault,
          userId,
        },
      });
    }),

  //  Delete blueprint
  deleteBlueprint: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.user.userId!;

      const blueprint = await ctx.db.architectureBlueprint.findFirst({
        where: { id, userId },
      });

      if (!blueprint) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Blueprint not found",
        });
      }

      // Get projectId before deleting for cache invalidation
      const projectId = blueprint.projectId;

      const result = await ctx.db.architectureBlueprint.delete({
        where: { id },
      });

      // Invalidate cache
      await CacheService.invalidatePattern(
        `architecture:${projectId}:blueprints:*`,
      );

      return result;
    }),
});
