"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MigrationProgressProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
  isInProgress: boolean;
}

export function MigrationProgress({
  progress,
  currentStep,
  totalSteps,
  isInProgress,
}: MigrationProgressProps) {
  if (!isInProgress) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Migration Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-muted-foreground text-xs">
            Step {currentStep} of {totalSteps}
          </p>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span>Applying changes... This may take a few minutes.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
