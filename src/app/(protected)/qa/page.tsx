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
import React, { useState, useMemo } from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Calendar,
  User,
  ChevronRight,
  FileCode,
  Sparkles,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "mostRelevant">(
    "newest",
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Get the selected question
  const selectedQuestion =
    questionIndex !== null && questions ? questions[questionIndex] : null;

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    if (!questions) return [];

    let filtered = questions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.answer.toLowerCase().includes(query),
      );
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "mostRelevant":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });
  }, [questions, searchQuery, sortBy]);

  const handleOpenQuestion = (index: number) => {
    setQuestionIndex(index);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setQuestionIndex(null), 300);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="space-y-6">
        <AskQuestionCard />
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
          <MessageSquare className="mb-4 h-12 w-12 text-zinc-400 dark:text-zinc-600" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No Questions Yet
          </h3>
          <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Ask your first question about the codebase to get AI-powered
            insights and start building your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ask Question Card */}
      <AskQuestionCard />

      {/* Header with Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            <Sparkles className="h-6 w-6 text-blue-500" />
            Saved Questions
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {questions.length} question{questions.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:min-w-50">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Sort */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as typeof sortBy)}
          >
            <SelectTrigger className="w-35">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="mostRelevant">Most Relevant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No questions match your search
              </p>
            </motion.div>
          ) : (
            filteredQuestions.map((q, index) => {
              const isSelected = questionIndex === index;
              const userName = q.user.firstName ?? q.user.lastName ?? "User";

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  onClick={() => handleOpenQuestion(index)}
                  className={cn(
                    "group relative cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-md dark:bg-zinc-950",
                    isSelected
                      ? "border-blue-500 shadow-md shadow-blue-500/10 dark:border-blue-500"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700",
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {q.user.imageUrl ? (
                        <Image
                          className="rounded-full"
                          alt={`${userName}'s profile picture`}
                          height={40}
                          width={40}
                          src={q.user.imageUrl}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          {getInitials(userName)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="line-clamp-1 text-base font-medium text-zinc-900 dark:text-zinc-100">
                          {q.question}
                        </p>
                        {isSelected && (
                          <Badge variant="default" className="shrink-0 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {q.answer}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 dark:text-zinc-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {userName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(q.createdAt), "MMM d, yyyy")}
                        </span>
                        {q.filesReferences &&
                          (q.filesReferences as any[]).length > 0 && (
                            <span className="flex items-center gap-1">
                              <FileCode className="h-3 w-3" />
                              {(q.filesReferences as any[]).length} references
                            </span>
                          )}
                        <span className="flex items-center gap-1 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                          Click to view
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Sheet Overlay for Question Details - Moved outside the map */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {selectedQuestion && (
          <SheetContent className="flex w-full flex-col gap-0 overflow-hidden border-l p-0 shadow-2xl sm:max-w-[85vw] md:max-w-[70vw] lg:max-w-[60vw]">
            {/* Header */}
            <div className="flex shrink-0 flex-col gap-1 border-b bg-linear-to-r from-zinc-50 to-white px-6 py-5 dark:from-zinc-900/50 dark:to-zinc-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Q&A</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="max-w-50 truncate">
                    {selectedQuestion.question}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseSheet}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <SheetTitle className="text-left text-xl leading-snug font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {selectedQuestion.question}
              </SheetTitle>
              <div className="mt-1 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {selectedQuestion.user.firstName ?? "User"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(
                    new Date(selectedQuestion.createdAt),
                    "MMM d, yyyy 'at' h:mm a",
                  )}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto px-6 py-6">
              {/* Answer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Explanation
                </div>
                <div className="prose prose-base dark:prose-invert w-full max-w-none leading-relaxed">
                  <MDEditor.Markdown
                    source={selectedQuestion.answer}
                    className="text-foreground! bg-transparent!"
                  />
                </div>
              </div>

              {/* Code References */}
              {selectedQuestion.filesReferences &&
                (selectedQuestion.filesReferences as any[]).length > 0 && (
                  <div className="mt-6 space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                      <FileCode className="h-3.5 w-3.5" />
                      Code References
                      <Badge variant="secondary" className="ml-1 text-[10px]">
                        {(selectedQuestion.filesReferences as any[]).length}
                      </Badge>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <CodeReferences
                        filesReferences={
                          (selectedQuestion.filesReferences ?? []) as any
                        }
                      />
                    </div>
                  </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex shrink-0 items-center justify-between border-t border-zinc-200 bg-zinc-50/50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900/20">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                onClick={() => window.open("/protected/qa", "_blank")}
              >
                <ArrowUpRight className="mr-1 h-3 w-3" />
                View Full Context
              </Button>
              <span className="text-xs text-zinc-400">
                Question #{questionIndex !== null ? questionIndex + 1 : 0} of{" "}
                {questions.length}
              </span>
            </div>
          </SheetContent>
        )}
      </Sheet>
    </div>
  );
};

export default QAPage;
