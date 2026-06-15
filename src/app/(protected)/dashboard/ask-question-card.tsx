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
    React.useState(""); // Holds context when text area resets
  const [loading, setLoading] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [files, setFiles] = React.useState<FileReference[]>([]);

  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project?.id || !question.trim()) return;

    setAnswer("");
    setFiles([]);

    // Cache the question being asked before wiping the textarea
    setCurrentAnsweredQuestion(question);

    try {
      setOpen(true);
      setLoading(true);

      const result = await askCodebaseQuestion(question, project.id);
      setAnswer(result.output ?? "No answer generated.");
      setFiles(result.filesReferences ?? []);
      setQuestion(""); // Clean input field for next question safely
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
        <DialogContent className="flex h-[85vh] max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[90vw]">
          {/* Header Panel */}
          <DialogHeader className="bg-background flex flex-row items-center justify-between space-y-0 border-b px-6 py-4">
            <div className="flex max-w-[65%] flex-col gap-1">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Image src="/logo.png" alt="codeforge" width={28} height={28} />
                CodeForge
              </DialogTitle>
              {currentAnsweredQuestion && !loading && (
                <p className="text-muted-foreground truncate text-xs italic">
                  Q: "{currentAnsweredQuestion}"
                </p>
              )}
            </div>

            {/* Action Buttons Right Aligned */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={saveAnswer.isPending || loading}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question: currentAnsweredQuestion, // Uses retained question string context
                      answer,
                      filesReferences: files, // ✅ FIX: maps local 'files' variable to schema expected key
                    },
                    {
                      onSuccess: () => {
                        toast.success(`Answer Saved!`);
                      },
                      onError: () => {
                        toast.error(`Failed to save answer!`);
                      },
                    },
                  );
                }}
              >
                {saveAnswer.isPending ? "Saving..." : "Save Answer"}
              </Button>
            </div>
          </DialogHeader>

          {/* Body content wrapper */}
          {loading ? (
            <div className="bg-muted/10 flex flex-1 flex-col items-center justify-center gap-3">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
              <div className="text-muted-foreground animate-pulse text-sm font-medium">
                Analyzing your codebase architecture...
              </div>
            </div>
          ) : (
            <div className="divide-border flex flex-1 divide-x overflow-hidden">
              {/* Left Side Markdown Explainer */}
              <div className="bg-background w-1/2 scrollbar-thin space-y-4 overflow-y-auto p-6">
                <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  Explanation
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <MDEditor.Markdown
                    source={answer || ""}
                    className="!text-foreground !bg-transparent leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Side Code Window */}
              <div className="bg-muted/20 flex w-1/2 flex-col overflow-hidden">
                {files.length > 0 ? (
                  <div className="flex h-full flex-col gap-4 overflow-hidden p-6">
                    <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      Code References
                    </div>
                    <div className="border-border bg-background flex-1 overflow-hidden rounded-xl border shadow-inner">
                      <CodeReferences filesReferences={files} />
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-6 text-center">
                    <p className="text-sm">
                      No context files were needed for this question.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Dialog Control Row */}
          {!loading && (
            <div className="bg-background flex justify-end border-t px-6 py-3">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-[#0A66FF] px-4 py-2 text-xs font-medium text-white shadow transition-colors hover:bg-[#0A66FF]/90"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Persistent User Query Input Form */}
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
