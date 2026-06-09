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
                <div className="w-px translate-x-1 bg-gray-200"></div>
              </div>
              <>
                <div className="relative mt-2 flex-none">
                  <Image
                    src={commit.commitAuthorAvatar || "/default-avatar.png"}
                    alt="commit avatar"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white"
                  />
                </div>
                <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-gray-200 ring-inset">
                  <div className="flex justify-between gap-x-4">
                    <Link
                      target="_blank"
                      href={`${project?.githubUrl}/commits/${commit.commitHash}`}
                      className="py-0.5 text-xs leading-5 text-gray-500"
                    >
                      <span className="font-medium text-gray-900">
                        {commit.commitAuthorName}{" "}
                      </span>
                      <span className="inline-flex items-center">
                        Commited <ExternalLink className="ml-1 size-4" />
                      </span>
                    </Link>
                  </div>
                  <span className="font-semibold">{commit.commitMessage}</span>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <p className="line-clamp-2 text-sm text-gray-500">
                      {extractSummary(commit.summary)}
                    </p>

                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="rounded-md p-2 hover:bg-gray-100">
                          <Eye className="size-4" />
                        </button>
                      </DialogTrigger>

                      <DialogContent className="h-[85vh] w-[90vw] max-w-6xl overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{commit.commitMessage}</DialogTitle>
                        </DialogHeader>

                        <div className="mt-4">
                          <pre className="text-sm leading-6 whitespace-pre-wrap">
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
