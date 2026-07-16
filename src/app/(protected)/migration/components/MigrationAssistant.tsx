"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Shield, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import {
  MigrationHeader,
  MigrationConfig,
  MigrationPlanSummary,
  MigrationProgress,
  MigrationSteps,
  MigrationRisks,
  MigrationDependencies,
  MigrationActions,
  MigrationSaveDialog,
  MigrationPlanList,
} from "./index";
import { useMigrationProgress } from "../hooks/useMigrationProgress";
import type { MigrationPlan, MigrationType } from "../types";

export function MigrationAssistant({ projectId }: { projectId: string }) {
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlan | null>(
    null,
  );
  const [savedPlans, setSavedPlans] = useState<MigrationPlan[]>([]);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showRollbackDialog, setShowRollbackDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [editingPlan, setEditingPlan] = useState<MigrationPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const { progress, currentStep, totalSteps, isInProgress } =
    useMigrationProgress(migrationPlan);

  // Get all saved plans
  const getPlansQuery = api.migration.getMigrationPlans.useQuery(
    { projectId },
    { enabled: !!projectId },
  );

  // Load plans on mount and when project changes
  useEffect(() => {
    if (getPlansQuery.data) {
      setSavedPlans(getPlansQuery.data as MigrationPlan[]);
    }
  }, [getPlansQuery.data]);

  // TRPC mutations
  const analyzeMutation = api.migration.analyzeMigration.useMutation({
    onSuccess: (data) => {
      const planData = data.plan as any;
      const typedPlan: MigrationPlan = {
        id: planData.id || "",
        name: planData.name || "Migration Plan",
        description: planData.description || "",
        type: planData.type || "refactor",
        status: planData.status || "ready",
        steps: planData.steps || [],
        risks: planData.risks || [],
        files: planData.files || [],
        dependencies: planData.dependencies || [],
        estimatedTime: planData.estimatedTime || "4-6 hours",
        progress: planData.progress || 0,
        currentStep: planData.currentStep || 0,
        totalSteps: planData.totalSteps || 0,
        createdAt: planData.createdAt || new Date(),
        updatedAt: planData.updatedAt || new Date(),
        githubPrNumber: planData.githubPrNumber,
        githubPrUrl: planData.githubPrUrl,
        githubBranch: planData.githubBranch,
      };
      setMigrationPlan(typedPlan);
      setPlanName(typedPlan.name);
      setPlanDescription(typedPlan.description || "");
      toast.success("Migration plan generated!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to analyze migration");
    },
  });

  const applyMigrationViaPR = api.migration.applyMigrationViaPR.useMutation({
    onSuccess: (data) => {
      setIsApplying(false);
      setShowApplyDialog(false);
      if (data.success) {
        toast.success(data.message);
        if (data.prUrl && migrationPlan) {
          setMigrationPlan({
            ...migrationPlan,
            status: "completed",
            progress: 100,
            githubPrNumber: data.prNumber,
            githubPrUrl: data.prUrl,
          });
        }
        getPlansQuery.refetch();
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      setIsApplying(false);
      toast.error(err.message || "Failed to apply migration");
    },
  });

  const rollbackViaGitHub = api.migration.rollbackViaGitHub.useMutation({
    onSuccess: (data) => {
      setIsRollingBack(false);
      setShowRollbackDialog(false);
      if (data.success) {
        toast.success(data.message);
        if (migrationPlan) {
          setMigrationPlan({
            ...migrationPlan,
            status: "rolled_back",
            githubPrNumber: undefined,
            githubPrUrl: undefined,
          });
        }
        getPlansQuery.refetch();
      } else {
        toast.error(data.message);
      }
    },
    onError: (err) => {
      setIsRollingBack(false);
      toast.error(err.message || "Failed to rollback");
    },
  });

  const savePlanMutation = api.migration.saveMigrationPlan.useMutation({
    onSuccess: (data) => {
      setIsSaving(false);
      setShowSaveDialog(false);
      toast.success("Plan saved successfully!");
      if (migrationPlan) {
        setMigrationPlan({
          ...migrationPlan,
          name: planName,
          description: planDescription,
          updatedAt: new Date(),
        });
      }
      getPlansQuery.refetch();
    },
    onError: (err) => {
      setIsSaving(false);
      toast.error(err.message || "Failed to save plan");
    },
  });

  const deletePlanMutation = api.migration.deleteMigrationPlan.useMutation({
    onSuccess: () => {
      setShowDeleteDialog(false);
      setDeletingPlanId(null);
      toast.success("Plan deleted successfully!");
      if (migrationPlan && migrationPlan.id === deletingPlanId) {
        setMigrationPlan(null);
      }
      getPlansQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete plan");
    },
  });

  const handleAnalyze = (type: MigrationType, target: string) => {
    analyzeMutation.mutate({
      projectId,
      target,
      type,
    });
  };

  const handleApplyMigration = () => {
    if (!migrationPlan) return;
    setIsApplying(true);
    applyMigrationViaPR.mutate({ planId: migrationPlan.id });
  };

  const handleRollbackMigration = () => {
    if (!migrationPlan) return;
    setIsRollingBack(true);
    rollbackViaGitHub.mutate({ planId: migrationPlan.id });
  };

  const handleSavePlan = () => {
    if (!migrationPlan) {
      toast.error("No plan to save");
      return;
    }
    if (!planName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }
    setIsSaving(true);
    savePlanMutation.mutate({
      planId: migrationPlan.id,
      name: planName,
      description: planDescription,
    });
  };

  const handleLoadPlan = (id: string) => {
    const plan = savedPlans.find((p) => p.id === id);
    if (plan) {
      setMigrationPlan(plan);
      setPlanName(plan.name);
      setPlanDescription(plan.description || "");
      toast.success(`Loaded plan: ${plan.name}`);
    }
  };

  const handleEditPlan = (plan: MigrationPlan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || "");
    setShowSaveDialog(true);
  };

  const handleDeletePlan = (id: string) => {
    setDeletingPlanId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeletePlan = () => {
    if (deletingPlanId) {
      deletePlanMutation.mutate({ planId: deletingPlanId });
    }
  };

  const handleCreateNew = () => {
    setMigrationPlan(null);
    setPlanName("");
    setPlanDescription("");
    toast.info("Configure and generate a new migration plan");
  };

  const isCompleted = migrationPlan?.status === "completed";
  const isRolledBack = migrationPlan?.status === "rolled_back";

  return (
    <div className="space-y-6">
      {/* Header */}
      <MigrationHeader
        status={migrationPlan?.status}
        isInProgress={isInProgress}
        progress={progress}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MigrationPlanList
            plans={savedPlans}
            onLoadPlan={handleLoadPlan}
            onDeletePlan={handleDeletePlan}
            onEditPlan={handleEditPlan}
            onCreateNew={handleCreateNew}
            isLoading={getPlansQuery.isLoading}
            currentPlanId={migrationPlan?.id}
          />
        </div>
      </div>

      {/* Config */}
      <MigrationConfig
        onAnalyze={handleAnalyze}
        isAnalyzing={analyzeMutation.isPending}
      />

      {/* Migration Plan */}
      <AnimatePresence>
        {migrationPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            {/* Summary */}
            <MigrationPlanSummary plan={migrationPlan} />

            {/* Progress */}
            <MigrationProgress
              progress={progress}
              currentStep={currentStep}
              totalSteps={totalSteps}
              isInProgress={isInProgress}
            />

            {/* Tabs */}
            <Tabs defaultValue="steps" className="space-y-4">
              <TabsList>
                <TabsTrigger value="steps">
                  <Code2 className="mr-2 h-4 w-4" />
                  Steps
                </TabsTrigger>
                <TabsTrigger value="risks">
                  <Shield className="mr-2 h-4 w-4" />
                  Risks
                </TabsTrigger>
                <TabsTrigger value="dependencies">
                  <Package className="mr-2 h-4 w-4" />
                  Dependencies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="steps">
                <MigrationSteps steps={migrationPlan.steps || []} />
              </TabsContent>

              <TabsContent value="risks">
                <MigrationRisks risks={migrationPlan.risks || []} />
              </TabsContent>

              <TabsContent value="dependencies">
                <MigrationDependencies
                  dependencies={migrationPlan.dependencies || []}
                />
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <MigrationActions
              status={migrationPlan.status}
              onApply={() => setShowApplyDialog(true)}
              onRollback={() => setShowRollbackDialog(true)}
              onSave={() => setShowSaveDialog(true)}
              isApplying={isApplying}
              isRollingBack={isRollingBack}
              prUrl={migrationPlan.githubPrUrl}
              prNumber={migrationPlan.githubPrNumber}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <MigrationSaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        planName={planName}
        onPlanNameChange={setPlanName}
        planDescription={planDescription}
        onPlanDescriptionChange={setPlanDescription}
        onSave={handleSavePlan}
        isSaving={isSaving}
        isEditing={!!editingPlan}
      />

      {/* Apply Confirmation Dialog */}
      <ConfirmationDialog
        open={showApplyDialog}
        onOpenChange={setShowApplyDialog}
        onConfirm={handleApplyMigration}
        title="Apply Migration Changes"
        description={`This will:
• Create a new branch on GitHub
• Apply AI-generated code changes to ${migrationPlan?.files?.length || 0} files
• Create a Pull Request for review
• Keep your main branch safe

⚠️ Make sure you have committed all your current work before proceeding.`}
        confirmText="Apply Changes"
        cancelText="Cancel"
        variant="default"
        isLoading={isApplying}
      />

      {/* Rollback Confirmation Dialog */}
      <ConfirmationDialog
        open={showRollbackDialog}
        onOpenChange={setShowRollbackDialog}
        onConfirm={handleRollbackMigration}
        title="Rollback Migration"
        description={`This will:
• Close the Pull Request
• Delete the migration branch
• Restore your code to its original state

⚠️ This action cannot be undone!`}
        confirmText="Rollback"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isRollingBack}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeletePlan}
        title="Delete Migration Plan"
        description={`Are you sure you want to delete this migration plan? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deletePlanMutation.isPending}
      />
    </div>
  );
}
