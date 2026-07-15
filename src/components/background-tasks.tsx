"use client";

import { useBackgroundTasks } from "@/hooks/use-background-tasks";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BackgroundTasks() {
  const { tasks, removeTask, clearCompleted } = useBackgroundTasks();
  const [isOpen, setIsOpen] = useState(false);

  const activeTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "failed",
  );
  const completedTasks = tasks.filter(
    (t) => t.status === "completed" || t.status === "failed",
  );
  const inProgressTasks = tasks.filter(
    (t) => t.status === "processing" || t.status === "pending",
  );

  if (tasks.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20";
      case "completed":
        return "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/20";
      case "failed":
        return "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20";
      case "pending":
        return "border-yellow-200 bg-yellow-50 dark:border-yellow-900/30 dark:bg-yellow-950/20";
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="fixed right-4 bottom-4 z-50">
      <DropdownMenu onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "relative rounded-full shadow-lg transition-all",
              inProgressTasks.length > 0 &&
                "border-blue-500 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50",
            )}
          >
            {inProgressTasks.length > 0 ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <span className="ml-2">
              {inProgressTasks.length > 0
                ? `${inProgressTasks.length} in progress`
                : completedTasks.length > 0
                  ? `${completedTasks.length} completed`
                  : "Tasks"}
            </span>
            {inProgressTasks.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {inProgressTasks.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="max-h-[80vh] w-100 overflow-y-auto p-4"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Background Tasks</h4>
                <p className="text-muted-foreground text-xs">
                  {inProgressTasks.length > 0
                    ? `${inProgressTasks.length} task${inProgressTasks.length > 1 ? "s" : ""} in progress`
                    : `${completedTasks.length} task${completedTasks.length > 1 ? "s" : ""} completed`}
                </p>
              </div>
              {completedTasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearCompleted();
                    toast.success("Cleared completed tasks");
                  }}
                  className="text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            <AnimatePresence>
              {tasks.length === 0 ? (
                <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                  No tasks
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "rounded-lg border p-3 transition-all",
                      getStatusColor(task.status),
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium">
                            {task.projectName}
                          </span>
                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                            {task.progress}%
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 truncate text-xs">
                          {task.message}
                        </p>
                        <div className="mt-2">
                          <Progress
                            value={task.progress}
                            className="h-1.5 w-full"
                            indicatorClassName={getProgressColor(task.status)}
                          />
                        </div>
                        {task.status === "failed" && (
                          <p className="mt-1 text-xs text-red-500">
                            Error: {task.message}
                          </p>
                        )}
                      </div>
                      {(task.status === "completed" ||
                        task.status === "failed") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            removeTask(task.id);
                            toast.info(`Removed task: ${task.projectName}`);
                          }}
                          className="h-6 w-6 shrink-0 p-0"
                        >
                          <XCircle className="text-muted-foreground hover:text-foreground h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
