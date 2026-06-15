import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { pullCommits } from "@/lib/github/github";
import { TRPCError } from "@trpc/server";
import {
  createProjectRateLimit,
  pullCommitsRateLimit,
} from "@/lib/security/ratelimit/rate-limit";
import { protectRequest } from "@/lib/security/arcjet/arcjet-protect";
import { indexGithubRepo } from "@/lib/github/github-loader";

export const projectRouter = createTRPCRouter({
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        githubUrl: z.string(),
        githubToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { success } = await createProjectRateLimit.limit(
        `create-project:${ctx.user.userId}`,
      );

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Project creation limit exceeded. Try again later.",
        });
      }

      await protectRequest();
      const project = await ctx.db.project.create({
        data: {
          githubUrl: input.githubUrl,
          name: input.name,
          userToProjects: {
            create: {
              userId: ctx.user.userId!,
            },
          },
        },
      });
      await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
      await pullCommits(project.id, ctx.user.userId!);
      return project;
    }),

  getProjects: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        userToProjects: {
          some: {
            userId: ctx.user.userId!,
          },
        },
        deletedAt: null,
      },
    });
  }),

  getCommits: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      await protectRequest();
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          userToProjects: {
            some: {
              userId: ctx.user.userId!,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this project",
        });
      }

      const { success } = await pullCommitsRateLimit.limit(
        `Pull-commits: ${ctx.user.userId}`,
      );

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Commit sync limit exceeded. Try again later.",
        });
      }

      pullCommits(input.projectId, ctx.user.userId!).catch(console.error);

      return await ctx.db.commit.findMany({
        where: {
          projectId: input.projectId,
        },
        orderBy: {
          commitDate: "desc",
        },
      });
    }),

  saveAnswer: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        question: z.string(),
        answer: z.string(),
        filesReferences: z.any(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.create({
        data: {
          answer: input.answer,
          filesReferences: input.filesReferences,
          projectId: input.projectId,
          question: input.question,
          userId: ctx.user.userId!,
        },
      });
    }),

  getQuestions: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.question.findMany({
        where: {
          projectId: input.projectId,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
