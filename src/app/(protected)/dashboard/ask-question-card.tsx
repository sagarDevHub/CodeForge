"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import Image from "next/image";
import React from "react";
import MDEditor from "@uiw/react-md-editor";
import { askCodebaseQuestion } from "./actions";
import CodeReferences from "./code-references";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";
import { useTheme } from "next-themes";
import { Loader2, Save, Check } from "lucide-react";

type FileReference = {
  fileName: string;
  summary: string;
  sourceCode: string;
};

const AskQuestionCard = () => {
  const { project } = useProject();
  const { resolvedTheme } = useTheme();

  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [currentAnsweredQuestion, setCurrentAnsweredQuestion] =
    React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [files, setFiles] = React.useState<FileReference[]>([]);

  const saveAnswer = api.project.saveAnswer.useMutation();
  const refetch = useRefetch();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id || !question.trim()) return;

    setAnswer("");
    setFiles([]);
    setCurrentAnsweredQuestion(question);

    try {
      setOpen(true);
      setLoading(true);

      const result = await askCodebaseQuestion(question, project.id);
      setAnswer(result.output ?? "No answer generated.");
      setFiles(result.filesReferences ?? []);
      setQuestion("");
    } catch (error) {
      console.error(error);
      setAnswer("Something went wrong while generating the answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-0 shadow-lg sm:max-w-[75vw] dark:border-zinc-800 dark:bg-zinc-950">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-200 bg-white py-4 pr-14 pl-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="codeforge"
                width={28}
                height={28}
                className="shrink-0"
              />

              <DialogTitle className="sr-only">CodeForge AI Answer</DialogTitle>

              {currentAnsweredQuestion && !loading && (
                <p className="line-clamp-1 max-w-[35vw] text-xs text-zinc-500 italic dark:text-zinc-400">
                  Q: "{currentAnsweredQuestion}"
                </p>
              )}
            </div>

            {!loading && answer && (
              <Button
                variant="outline"
                size="sm"
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question: currentAnsweredQuestion,
                      answer,
                      filesReferences: files,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved!");
                        refetch();
                      },
                      onError: () => toast.error("Failed to save answer!"),
                    },
                  );
                }}
                className={`h-8 shrink-0 cursor-pointer gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                  saveAnswer.isSuccess
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : "border-zinc-200 bg-transparent text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {saveAnswer.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : saveAnswer.isSuccess ? (
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                <span>
                  {saveAnswer.isPending
                    ? "Saving..."
                    : saveAnswer.isSuccess
                      ? "Saved"
                      : "Save Answer"}
                </span>
              </Button>
            )}
          </DialogHeader>

          {loading ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/10">
              <Loader2 className="h-8 w-8 animate-spin text-[#0A66FF]" />
              <div className="animate-pulse text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Analyzing your codebase architecture...
              </div>
            </div>
          ) : (
            <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto bg-white p-6 dark:bg-zinc-950">
              <div
                className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-zinc-900 dark:text-zinc-50"
                data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}
              >
                <MDEditor.Markdown
                  source={answer || ""}
                  className="!bg-transparent !text-current"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                  <CodeReferences filesReferences={files} />
                </div>
              )}
            </div>
          )}

          {!loading && (
            <div className="flex justify-end border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 w-full cursor-pointer rounded-lg bg-[#0A66FF] text-sm font-medium text-white shadow transition-colors hover:bg-[#0A66FF]/90"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to change the homepage?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[110px] resize-none border-zinc-200 bg-transparent text-zinc-900 focus-visible:ring-1 dark:border-zinc-800 dark:text-zinc-50"
            />
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-lg bg-[#0A66FF] px-4 font-medium text-white shadow hover:bg-[#0A66FF]/90 disabled:opacity-50"
            >
              Ask CodeForge!
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
