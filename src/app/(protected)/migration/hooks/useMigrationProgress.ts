import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import type { MigrationPlan } from "../types";

export function useMigrationProgress(plan: MigrationPlan | null) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const progressQuery = api.migration.getMigrationProgress.useQuery(
    { planId: plan?.id || "" },
    { enabled: !!plan?.id && plan?.status === "in_progress" },
  );

  useEffect(() => {
    if (progressQuery.data) {
      setProgress(progressQuery.data.progress);
      setCurrentStep(progressQuery.data.currentStep);
      setTotalSteps(progressQuery.data.totalSteps);
    }
  }, [progressQuery.data]);

  const resetProgress = () => {
    setProgress(0);
    setCurrentStep(0);
    setTotalSteps(0);
  };

  return {
    progress,
    currentStep,
    totalSteps,
    isInProgress: progressQuery.data?.status === "in_progress",
    isCompleted: progressQuery.data?.status === "completed",
    resetProgress,
  };
}
