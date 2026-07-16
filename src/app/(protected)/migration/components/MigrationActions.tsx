"use client";

import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface MigrationActionsProps {
  status: string;
  onApply: () => void;
  onRollback: () => void;
  onSave: () => void;
  isApplying: boolean;
  isRollingBack: boolean;
  prUrl?: string;
  prNumber?: number;
}

export function MigrationActions({
  status,
  onApply,
  onRollback,
  onSave,
  isApplying,
  isRollingBack,
  prUrl,
  prNumber,
}: MigrationActionsProps) {
  const isCompleted = status === "completed";
  const isInProgress = status === "in_progress";
  const isRolledBack = status === "rolled_back";
  const isFailed = status === "failed";

  return (
    <div className="flex flex-wrap justify-end gap-3">
      {/* PR Link if completed */}
      {isCompleted && prUrl && (
        <Button variant="outline" asChild>
          <a href={prUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View PR #{prNumber}
          </a>
        </Button>
      )}

      <Button variant="outline" onClick={onSave}>
        <ThumbsUp className="mr-2 h-4 w-4" />
        Save Plan
      </Button>

      {/* Apply button - only if not completed or in progress */}
      {!isCompleted && !isInProgress && !isRolledBack && !isFailed && (
        <Button onClick={onApply} className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Apply Changes
        </Button>
      )}

      {/* Rollback button - only if completed */}
      {isCompleted && !isRolledBack && (
        <Button onClick={onRollback} variant="destructive">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Rollback Changes
        </Button>
      )}

      {/* Loading states */}
      {isApplying && (
        <Button disabled className="bg-blue-600">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Applying Changes...
        </Button>
      )}

      {isRollingBack && (
        <Button disabled variant="destructive">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Rolling Back...
        </Button>
      )}

      {/* Retry button for failed */}
      {isFailed && (
        <Button onClick={onApply} className="bg-orange-600 hover:bg-orange-700">
          <span className="mr-2">⟳</span>
          Retry
        </Button>
      )}
    </div>
  );
}
