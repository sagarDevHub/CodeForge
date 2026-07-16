"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCode, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MigrationStep } from "../types";

interface MigrationStepsProps {
  steps: MigrationStep[];
}

export function MigrationSteps({ steps }: MigrationStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!steps || steps.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center">
          No steps available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Migration Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, idx) => {
          const isActive = currentStep === idx;
          const isCompleted = idx < currentStep;

          return (
            <div
              key={idx}
              className={cn(
                "cursor-pointer rounded-lg border p-4 transition-all",
                isActive ? "border-blue-500 shadow-md" : "hover:shadow-md",
                isCompleted &&
                  "border-green-200 bg-green-50/50 dark:bg-green-950/10",
              )}
              onClick={() => setCurrentStep(idx)}
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="mt-1 h-5 w-5 text-green-500" />
                  ) : (
                    <Badge className="mt-1">{step.order}</Badge>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={cn(
                        "font-semibold",
                        isCompleted && "text-green-700 dark:text-green-400",
                      )}
                    >
                      {step.title}
                    </h4>
                    {isCompleted && (
                      <span className="text-xs text-green-600">
                        ✓ Completed
                      </span>
                    )}
                    {isActive && (
                      <span className="animate-pulse text-xs text-blue-500">
                        ● In progress
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {step.description}
                  </p>
                  {step.files && step.files.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {step.files.map((file) => (
                        <Badge
                          key={file}
                          variant="secondary"
                          className="text-xs"
                        >
                          <FileCode className="mr-1 h-3 w-3" />
                          {file}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {step.commands && step.commands.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        Commands:
                      </p>
                      {step.commands.map((cmd, idx) => (
                        <code
                          key={idx}
                          className="block rounded bg-zinc-100 p-2 font-mono text-xs dark:bg-zinc-800"
                        >
                          {cmd}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentStep(idx);
                  }}
                >
                  <ArrowRight
                    className={cn("h-4 w-4", isActive && "text-blue-500")}
                  />
                </Button>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between border-t pt-4">
          <span className="text-muted-foreground text-xs">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
              disabled={currentStep === steps.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
