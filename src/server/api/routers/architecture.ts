import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { CACHE_TTL, cacheKeys } from "@/lib/redis/client";
import { CacheService } from "@/lib/services/cache-service";
import { generateArchitectureGraph } from "@/lib/ai/groq";

export const architectureRouter = createTRPCRouter({
  // Get architecture
  getArchitecture: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { projectId } = input;
      const userId = ctx.user.userId!;

      // Check access
      const access = await ctx.db.userToProject.findUnique({
        where: { userId_projectId: { userId, projectId } },
      });

      if (!access)
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });

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

          // Create edges based on file references
          const edges: Array<{ source: string; target: string; type: string }> =
            [];

          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              const sourcePath = nodes[i]?.label;
              const targetPath = nodes[j]?.label;
              const sourceFolder = sourcePath
                ?.split("/")
                .slice(0, -1)
                .join("/");
              const targetFolder = targetPath
                ?.split("/")
                .slice(0, -1)
                .join("/");

              if (sourceFolder === targetFolder && sourceFolder) {
                edges.push({
                  source: nodes[i].id,
                  target: nodes[j].id,
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
});
