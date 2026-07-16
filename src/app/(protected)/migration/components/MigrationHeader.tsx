"use client";

import { Rocket } from "lucide-react";
import { MigrationStatusBadge } from "./MigrationStatusBadge";

interface MigrationHeaderProps {
  status?: string;
  isInProgress: boolean;
  progress: number;
}

export function MigrationHeader({
  status,
  isInProgress,
  progress,
}: MigrationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Rocket className="h-6 w-6 text-blue-500" />
          Migration Assistant
        </h1>
        <p className="text-muted-foreground text-sm">
          AI-powered code migration and refactoring
        </p>
      </div>
      {status && (
        <div className="flex items-center gap-2">
          <MigrationStatusBadge status={status} />
          {isInProgress && (
            <div className="flex items-center gap-2 text-sm">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>{progress}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
