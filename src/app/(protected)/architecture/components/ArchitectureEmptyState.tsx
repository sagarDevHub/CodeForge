"use client";

import { AlertCircle } from "lucide-react";

export function ArchitectureEmptyState() {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
      <h1 className="mt-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
        No Active Project Selected
      </h1>
      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
        Select a workspace repository from the sidebar to analyze its system
        blueprint.
      </p>
    </div>
  );
}
