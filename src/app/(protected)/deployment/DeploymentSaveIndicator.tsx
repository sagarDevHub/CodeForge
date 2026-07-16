"use client";

import { CheckCircle2 } from "lucide-react";

interface DeploymentSaveIndicatorProps {
  isSaved: boolean;
}

export function DeploymentSaveIndicator({
  isSaved,
}: DeploymentSaveIndicatorProps) {
  if (!isSaved) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-600 dark:bg-green-950/30">
      <CheckCircle2 className="h-4 w-4" />
      <span>Analysis saved</span>
    </div>
  );
}
