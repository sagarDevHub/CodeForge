"use client";

import { usePageTitle } from "@/hooks/use-page-title";
import React, { useState, useEffect } from "react";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

import { Button } from "@/components/ui/button";
import { DeploymentEmptyState } from "./components/DeploymentEmptyState";
import { DeploymentHeader } from "./components/DeploymentHeader";
import { DeploymentReportList } from "./components/DeploymentReportList";
import { DeploymentLoadingState } from "./components/DeploymentLoadingState";
import { DeploymentSaveIndicator } from "./components/DeploymentSaveIndicator";
import { DeploymentSummary } from "./components/DeploymentSummary";
import { DeploymentScoreCards } from "./components/DeploymentScoreCards";
import { DeploymentLeftPanel } from "./components/DeploymentLeftPanel";
import { DeploymentSaveDialog } from "./components/DeploymentSaveDialog";
import { DeploymentRightPanel } from "./components/DeploymentRightPanel";
import type { AIAnalysis, SavedReport } from "./types";

const DeploymentPage = () => {
  usePageTitle();
  const { project } = useProject();
  const projectId = project?.id;

  const [analysisData, setAnalysisData] = useState<AIAnalysis | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [isDefaultReport, setIsDefaultReport] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<SavedReport | null>(
    null,
  );
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    setAnalysisData(null);
    setSavedReports([]);
    setSelectedReportId(null);
    setIsSaved(false);
  }, [projectId]);

  // API calls with force refresh support
  const analyzeMutation = api.deployment.analyze.useMutation({
    onSuccess: (data) => {
      setAnalysisData(data.analysis);
      setIsSaved(false);
      toast.success("AI analysis completed!", {
        description: `Score: ${data.score}/100 • Risk: ${data.riskLevel}`,
      });
      loadReports();
      setForceRefresh(false);
    },
    onError: (err) => {
      toast.error(err.message || "Analysis failed");
      setForceRefresh(false);
    },
  });

  const saveReportMutation = api.deployment.saveReport.useMutation({
    onSuccess: () => {
      setIsSaved(true);
      toast.success(`Report "${reportName}" saved!`);
      setSaveDialogOpen(false);
      setReportName("");
      loadReports();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to save report");
    },
  });

  const deleteReportMutation = api.deployment.deleteReport.useMutation({
    onSuccess: () => {
      toast.success(`Report "${reportToDelete?.name}" deleted`);
      setDeleteDialogOpen(false);
      setReportToDelete(null);
      loadReports();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete");
    },
  });

  const getReportsQuery = api.deployment.getAllReports.useQuery(
    { projectId: projectId! },
    {
      enabled: !!projectId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  );

  const getOneReportQuery = api.deployment.getOneReport.useQuery(
    { id: selectedReportId || "placeholder" },
    {
      enabled: !!selectedReportId && selectedReportId?.trim() !== "",
    },
  );

  // Effects
  useEffect(() => {
    if (getReportsQuery.data) {
      setSavedReports(getReportsQuery.data);
    }
  }, [getReportsQuery.data]);

  useEffect(() => {
    if (getOneReportQuery.data && selectedReportId) {
      const reportData = getOneReportQuery.data as any;
      setAnalysisData(reportData.data as AIAnalysis);
      setIsSaved(true);
      const report = savedReports.find((r) => r.id === selectedReportId);
      if (report) {
        toast.success(`Loaded report: ${report.name}`);
      }
    }
  }, [getOneReportQuery.data, selectedReportId, savedReports]);

  // Handlers
  const loadReports = async () => {
    if (projectId) {
      await getReportsQuery.refetch();
    }
  };

  const handleAnalyze = () => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }
    if (analysisData) {
      setForceRefresh(true);
    }
    analyzeMutation.mutate({ projectId, forceRefresh: !!analysisData });
  };

  const handleSaveReport = () => {
    if (!analysisData || !projectId) {
      toast.error("No analysis to save");
      return;
    }
    if (!reportName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    saveReportMutation.mutate({
      projectId,
      name: reportName.trim(),
      data: analysisData,
      metadata: {
        createdAt: new Date().toISOString(),
        score: analysisData.score,
        riskLevel: analysisData.riskLevel,
      },
      isDefault: isDefaultReport,
    });
  };

  const handleLoadReport = (id: string) => {
    const report = savedReports.find((r) => r.id === id);
    if (report) {
      setSelectedReportId(id);
    }
  };

  const handleDeleteReport = (id: string) => {
    const report = savedReports.find((r) => r.id === id);
    if (report) {
      setReportToDelete(report);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDeleteReport = () => {
    if (reportToDelete) {
      deleteReportMutation.mutate({ id: reportToDelete.id });
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "LOW":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "CRITICAL":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  useEffect(() => {
    if (projectId) {
      loadReports();
    }
  }, [projectId]);

  if (!projectId) {
    return <DeploymentEmptyState />;
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header with Report List */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <DeploymentHeader
          projectName={project?.name || ""}
          isAnalyzing={analyzeMutation.isPending}
          hasAnalysis={!!analysisData}
          onAnalyze={handleAnalyze}
        />

        <div className="flex items-center gap-2">
          <DeploymentReportList
            reports={savedReports}
            onLoadReport={handleLoadReport}
            onDeleteReport={handleDeleteReport}
            onSaveClick={() => setSaveDialogOpen(true)}
            isLoading={analyzeMutation.isPending}
          />

          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {analyzeMutation.isPending ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {forceRefresh ? "Refreshing..." : "Analyzing..."}
              </>
            ) : analysisData ? (
              <>
                <span className="mr-2">⟳</span>
                Re-Analyze
              </>
            ) : (
              "Run AI Analysis"
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {analyzeMutation.isPending && <DeploymentLoadingState />}

      {/* Analysis Results */}
      {analysisData && !analyzeMutation.isPending && (
        <>
          <DeploymentSaveIndicator isSaved={isSaved} />

          <DeploymentSummary
            analysis={analysisData}
            getRiskColor={getRiskColor}
          />

          <DeploymentScoreCards analysis={analysisData} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DeploymentLeftPanel analysis={analysisData} />
            <DeploymentRightPanel analysis={analysisData} />
          </div>
        </>
      )}

      {/* Save Dialog */}
      <DeploymentSaveDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        reportName={reportName}
        onReportNameChange={setReportName}
        isDefault={isDefaultReport}
        onIsDefaultChange={setIsDefaultReport}
        onSave={handleSaveReport}
        isSaving={saveReportMutation.isPending}
        savedReportsCount={savedReports.length}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteReport}
        title={`Delete "${reportToDelete?.name || "Report"}"`}
        description={`Are you sure you want to delete the report "${reportToDelete?.name || "this report"}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteReportMutation.isPending}
      />
    </div>
  );
};

export default DeploymentPage;
