"use client";

import useProject from "@/hooks/use-project";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Eye, ExternalLink } from "lucide-react";

const extractSummary = (summary: string) => {
  const match = summary.match(
    /\*\*Summary:\*\*([\s\S]*?)(?=\*\*Files Changed:\*\*|$)/,
  );

  return match?.[1]?.trim() || summary.slice(0, 120);
};

const CommitLog = () => {
  const { projectId, project } = useProject();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });

  return (
    <>
      <ul className="space-y-6">
        {commits?.map((commit, commitIdx) => {
          return (
            <li key={commit.id} className="relative flex gap-x-4">
              <div
                className={cn(
                  commitIdx === commits.length - 1 ? "h-0" : "-bottom-6",
                  "absolute top-0 left-0 flex w-6 justify-center",
                )}
              >
                <div className="w-px translate-x-1 bg-zinc-200 dark:bg-zinc-800"></div>
              </div>

              <>
                <div className="relative mt-2 flex-none">
                  <Image
                    src={commit.commitAuthorAvatar || "/default-avatar.png"}
                    alt="commit avatar"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-zinc-950"
                  />
                </div>

                <div className="flex-auto rounded-md border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="mb-1 flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="py-0.5 text-xs leading-5 text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                    >
                      <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                        {commit.commitAuthorName}{" "}
                      </span>
                      <span className="ml-1 inline-flex items-center gap-0.5 text-zinc-400 dark:text-zinc-500">
                        Committed <ExternalLink className="size-3" />
                      </span>
                    </Link>
                  </div>

                  <span className="text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
                    {commit.commitMessage}
                  </span>

                  <div className="mt-2 flex items-start justify-between gap-4">
                    <p className="line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {extractSummary(commit.summary)}
                    </p>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="shrink-0 cursor-pointer rounded-md p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
                          <Eye className="size-4" />
                        </button>
                      </DialogTrigger>

                      <DialogContent className="custom-scrollbar h-[85vh] w-[90vw] max-w-6xl overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
                        <DialogHeader className="border-b border-zinc-100 pb-4 dark:border-zinc-900">
                          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            {commit.commitMessage}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="mt-4">
                          <pre className="overflow-x-auto rounded-lg border border-zinc-100 bg-zinc-50 p-4 font-mono text-sm leading-6 whitespace-pre-wrap text-zinc-800 dark:border-zinc-900/60 dark:bg-zinc-900/40 dark:text-zinc-200">
                            {commit.summary}
                          </pre>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default CommitLog;
