"use client";

import { Loader2 } from "lucide-react";

export function ArchitectureLoadingState() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <div className="animate-pulse text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Running deep system relationship extraction...
      </div>
      <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-blue-500 transition-all duration-1000"
          style={{ width: "60%" }}
        />
      </div>
    </div>
  );
}
