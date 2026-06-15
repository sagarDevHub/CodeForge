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

type FileReference = {
  fileName: string;
  summary: string;
  sourceCode: string;
};

const AskQuestionCard = () => {
  const { project } = useProject();

  const [open, setOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [currentAnsweredQuestion, setCurrentAnsweredQuestion] =
    React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [files, setFiles] = React.useState<FileReference[]>([]);

  const saveAnswer = api.project.saveAnswer.useMutation();

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

  const refetch = useRefetch();

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] max-h-[90vh] flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-lg sm:max-w-[75vw]">
          {/* Header Panel — Added pr-14 to prevent overlapping the 'X' button */}
          <DialogHeader className="bg-background flex flex-row items-center justify-between space-y-0 border-b py-4 pr-14 pl-6">
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
                <p className="text-muted-foreground line-clamp-1 max-w-[35vw] text-xs italic">
                  Q: "{currentAnsweredQuestion}"
                </p>
              )}
            </div>

            {/* Save Action Button */}
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
                        (toast.success(`Answer Saved!`), refetch());
                      },
                      onError: () => toast.error(`Failed to save answer!`),
                    },
                  );
                }}
                className={`h-8 shrink-0 gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                  saveAnswer.isSuccess
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "hover:bg-muted"
                }`}
              >
                {saveAnswer.isPending ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : saveAnswer.isSuccess ? (
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="text-muted-foreground h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
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

          {/* Core Content Area */}
          {loading ? (
            <div className="bg-muted/10 flex flex-1 flex-col items-center justify-center gap-3">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
              <div className="text-muted-foreground animate-pulse text-sm font-medium">
                Analyzing your codebase architecture...
              </div>
            </div>
          ) : (
            <div className="bg-background custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert text-foreground max-w-none leading-relaxed">
                <MDEditor.Markdown
                  source={answer || ""}
                  className="!text-foreground !bg-transparent"
                />
              </div>

              {files.length > 0 && (
                <div className="border-border/60 space-y-3 border-t pt-4">
                  <CodeReferences filesReferences={files} />
                </div>
              )}
            </div>
          )}

          {/* Bottom Action Footer — Added clean wrapping layout padding */}
          {!loading && (
            <div className="bg-background flex justify-end border-t p-4">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="h-10 w-full rounded-lg bg-[#0A66FF] text-sm font-medium text-white shadow transition-colors hover:bg-[#0A66FF]/90"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="relative col-span-3 rounded-xl border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Textarea
              placeholder="Which file should I edit to change the homepage?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[110px] resize-none focus-visible:ring-1"
            />
            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#0A66FF] px-4 font-medium text-white shadow hover:bg-[#0A66FF]/90"
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
