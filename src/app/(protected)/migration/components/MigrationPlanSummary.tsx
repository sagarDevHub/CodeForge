"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  FileCode,
  Package,
  CheckCircle2,
  AlertTriangle,
  Shield,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import type { MigrationPlan } from "../types";
import { MigrationStatusBadge } from "./MigrationStatusBadge";

interface MigrationPlanSummaryProps {
  plan: MigrationPlan;
}

export function MigrationPlanSummary({ plan }: MigrationPlanSummaryProps) {
  const isCompleted = plan.status === "completed";
  const isFailed = plan.status === "failed";
  const isRolledBack = plan.status === "rolled_back";
  const isInProgress = plan.status === "in_progress";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-blue-500">🚀</span>
          Migration Plan: {plan.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{plan.description}</p>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span>{plan.estimatedTime || "4-6 hours"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileCode className="text-muted-foreground h-4 w-4" />
            <span>{plan.files?.length || 0} files affected</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Package className="text-muted-foreground h-4 w-4" />
            <span>{plan.dependencies?.length || 0} dependencies to update</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MigrationStatusBadge status={plan.status} />
          </div>
        </div>

        {/* PR Link */}
        {isCompleted && plan.githubPrUrl && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
            <GitBranch className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Pull Request created:</span>
            <a
              href={plan.githubPrUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
            >
              #{plan.githubPrNumber} View on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Status Messages */}
        {isCompleted && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-600 dark:bg-green-950/30">
            <CheckCircle2 className="h-4 w-4" />
            <span>Migration completed successfully!</span>
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4" />
            <span>Migration failed. Please try again.</span>
          </div>
        )}

        {isRolledBack && (
          <div className="flex items-center gap-2 rounded-lg bg-purple-50 p-3 text-purple-600 dark:bg-purple-950/30">
            <Shield className="h-4 w-4" />
            <span>Migration has been rolled back.</span>
          </div>
        )}

        {isInProgress && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-yellow-600 dark:bg-yellow-950/30">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Migration in progress...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
