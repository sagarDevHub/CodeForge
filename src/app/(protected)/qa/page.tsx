"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = React.useState(0);
  const question = questions?.[questionIndex];
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Quesions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>

      {/* Side View Overlay Answer Inspector Sheet */}
      {question && (
        <SheetContent className="bg-background flex w-full flex-col gap-0 overflow-hidden border-l p-0 shadow-2xl sm:max-w-[75vw]">
          {/* 1. QUESTION HEADER ZONE */}
          <div className="flex w-full shrink-0 flex-col gap-1.5 border-b bg-zinc-50/50 px-6 py-5 text-left dark:bg-zinc-900/20">
            <span className="text-[10px] font-bold tracking-widest text-[#0A66FF] uppercase">
              Saved Query Resolution
            </span>
            {/* Explicitly keeping SheetTitle for Radix A11y while styling it beautifully */}
            <SheetTitle className="text-foreground m-0 text-left text-xl leading-snug font-bold tracking-tight">
              {question.question}
            </SheetTitle>
          </div>

          {/* 2. DEDICATED VERTICAL CONTENT ZONE */}
          <div className="bg-background custom-scrollbar flex flex-1 flex-col space-y-8 overflow-y-auto px-6 py-6 text-left">
            {/* ANSWER BOX SECTION */}
            <div className="flex w-full flex-col gap-3 text-left">
              <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-wider uppercase">
                Explanation
              </h3>
              <div className="prose prose-base dark:prose-invert text-foreground w-full max-w-none text-left leading-relaxed">
                <MDEditor.Markdown
                  source={question.answer}
                  className="text-foreground! bg-transparent! text-left"
                />
              </div>
            </div>

            {/* FILES REFERENCES / CODE BOX SECTION */}
            {question.filesReferences &&
              (question.filesReferences as any[]).length > 0 && (
                <div className="border-border/80 flex w-full flex-col space-y-4 border-t pt-6 text-left">
                  <h3 className="text-muted-foreground/80 text-xs font-semibold tracking-wider uppercase">
                    Context Code References
                  </h3>
                  <div className="w-full overflow-hidden rounded-xl border text-left">
                    <CodeReferences
                      filesReferences={(question.filesReferences ?? []) as any}
                    />
                  </div>
                </div>
              )}
          </div>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
