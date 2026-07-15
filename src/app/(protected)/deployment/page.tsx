"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import {
  ShieldCheck,
  AlertTriangle,
  Terminal,
  CheckCircle2,
  Layers,
  Sparkles,
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  Gauge,
  Cpu,
  Lock,
  RefreshCw,
  Save,
  Trash2,
  FolderOpen,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Types
interface AIAnalysis {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  performanceScore: number;
  securityScore: number;
  maintainabilityScore: number;
  confidence: number;
  issues: string[];
  recommendations: string[];
  suggestions: Array<{
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    effort: "LOW" | "MEDIUM" | "HIGH";
  }>;
  stack: string[];
  strengths: string[];
  weaknesses: string[];
}

interface SavedReport {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  metadata: any;
}

const DeploymentPage = () => {
  const { project } = useProject();
  const projectId = project?.id;

  const [analysisData, setAnalysisData] = useState<AIAnalysis | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [reportName, setReportName] = useState("");
  const [isDefaultReport, setIsDefaultReport] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["summary", "issues", "suggestions"]),
  );

  // API calls
  const analyzeMutation = api.deployment.analyze.useMutation({
    onSuccess: (data) => {
      setAnalysisData(data.analysis);
      setIsSaved(false);
      toast.success("AI analysis completed!", {
        description: `Score: ${data.score}/100 • Risk: ${data.riskLevel}`,
      });
      loadReports();
    },
    onError: (err) => {
      toast.error(err.message || "Analysis failed");
    },
  });

  const saveReportMutation = api.deployment.saveReport.useMutation({
    onSuccess: (data) => {
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
      toast.success("Report deleted");
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

  // Sync to local state when data changes
  useEffect(() => {
    if (getReportsQuery.data) {
      console.log("📊 Reports loaded:", getReportsQuery.data);
      setSavedReports(getReportsQuery.data);
    }
  }, [getReportsQuery.data]);

  const getOneReportQuery = api.deployment.getOneReport.useQuery(
    { id: selectedReportId || "placeholder" },
    {
      enabled: !!selectedReportId && selectedReportId?.trim() !== "",
    },
  );

  useEffect(() => {
    if (
      getOneReportQuery.isError ||
      !getOneReportQuery.data ||
      !selectedReportId
    ) {
      return;
    }

    const reportData = getOneReportQuery.data as any;
    setAnalysisData(reportData.data as AIAnalysis);
    setIsSaved(true);

    const report = savedReports.find((r) => r.id === selectedReportId);
    if (report) {
      toast.success(`Loaded report: ${report.name}`);
    }
  }, [
    getOneReportQuery.data,
    getOneReportQuery.isError,
    selectedReportId,
    savedReports,
  ]);

  const loadReports = async () => {
    if (projectId) {
      console.log("🔄 Refetching reports...");
      await getReportsQuery.refetch();
    }
  };

  const handleAnalyze = () => {
    if (!projectId) {
      toast.error("No project selected");
      return;
    }
    analyzeMutation.mutate({ projectId });
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

    console.log("💾 Saving report:", {
      projectId,
      name: reportName,
      data: analysisData,
      isDefault: isDefaultReport,
    });

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
    if (!report) return;

    console.log("📂 Loading report:", report.name);
    setSelectedReportId(id);

    getOneReportQuery.refetch().then((result) => {
      if (result.data) {
        const reportData = result.data as any;
        setAnalysisData(reportData.data as AIAnalysis);
        setIsSaved(true);
        toast.success(`Loaded report: ${report.name}`);
      }
    });
  };

  const handleDeleteReport = (id: string) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      deleteReportMutation.mutate({ id });
    }
  };

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) newSet.delete(section);
    else newSet.add(section);
    setExpandedSections(newSet);
  };

  // Helper functions
  const getScoreTier = (score: number) => {
    if (score >= 90) return { label: "Production Ready", color: "emerald" };
    if (score >= 70) return { label: "Warning Threshold", color: "amber" };
    return { label: "Critical", color: "rose" };
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

  // Log reports whenever they change
  useEffect(() => {
    console.log("📋 Saved reports updated:", savedReports.length, savedReports);
  }, [savedReports]);

  if (!projectId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="p-6 text-center">
          <Terminal className="text-muted-foreground mx-auto h-12 w-12" />
          <h2 className="mt-4 text-xl font-bold">No Project Selected</h2>
          <p className="text-muted-foreground text-sm">
            Select a project from the sidebar to analyze.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldCheck className="h-6 w-6 text-blue-500" />
              Deployment Readiness
            </h1>
            <p className="text-muted-foreground text-sm">
              AI-powered analysis for <strong>{project?.name}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Saved reports dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Reports ({savedReports.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {savedReports.length === 0 ? (
                  <DropdownMenuItem disabled>No saved reports</DropdownMenuItem>
                ) : (
                  savedReports.map((r) => (
                    <DropdownMenuItem
                      key={r.id}
                      className="flex justify-between"
                    >
                      <span
                        className="flex-1 cursor-pointer truncate"
                        onClick={() => handleLoadReport(r.id)}
                      >
                        {r.name}
                        {r.isDefault && (
                          <Star className="ml-1 inline h-3 w-3 text-yellow-500" />
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(r.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Current Analysis
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Analyze button */}
            <Button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : analysisData ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-Analyze
                </>
              ) : (
                "Run AI Analysis"
              )}
            </Button>
          </div>
        </div>

        {/* Analysis Results */}
        {analyzeMutation.isPending && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">
                AI is analyzing your codebase...
              </p>
              <div className="bg-muted h-1.5 w-64 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: "0%" }}
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {analysisData && !analyzeMutation.isPending && (
          <>
            {/* Save indicator */}
            {isSaved && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-600 dark:bg-green-950/30">
                <Save className="h-4 w-4" />
                <span>Analysis saved</span>
              </div>
            )}

            {/* AI Summary */}
            <Card className="border-blue-200 dark:border-blue-900">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">AI Executive Summary</h3>
                      <Badge variant="outline" className="text-xs">
                        Confidence: {Math.round(analysisData.confidence || 0)}%
                      </Badge>
                      <Badge className={getRiskColor(analysisData.riskLevel)}>
                        Risk: {analysisData.riskLevel}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {analysisData.summary}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: "Overall", value: analysisData.score, icon: Gauge },
                {
                  label: "Security",
                  value: analysisData.securityScore || 0,
                  icon: Lock,
                },
                {
                  label: "Performance",
                  value: analysisData.performanceScore || 0,
                  icon: Cpu,
                },
                {
                  label: "Maintainability",
                  value: analysisData.maintainabilityScore || 0,
                  icon: Layers,
                },
              ].map((metric) => (
                <Card key={metric.label}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <metric.icon className="h-4 w-4 text-blue-500" />
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        {metric.label}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">{metric.value}</span>
                      <span className="text-muted-foreground text-xs">
                        /100
                      </span>
                    </div>
                    <Progress value={metric.value} className="mt-1 h-1.5" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Stack */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Layers className="h-4 w-4" />
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisData.stack && analysisData.stack.length > 0 ? (
                        analysisData.stack.map((item) => (
                          <Badge
                            key={item}
                            variant="secondary"
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          No stack detected
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths */}
                {analysisData.strengths &&
                  analysisData.strengths.length > 0 && (
                    <Card className="border-emerald-200 dark:border-emerald-900">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                          <TrendingUp className="h-4 w-4" />
                          Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {analysisData.strengths.map((s, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                {/* Weaknesses */}
                {analysisData.weaknesses &&
                  analysisData.weaknesses.length > 0 && (
                    <Card className="border-rose-200 dark:border-rose-900">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-rose-600">
                          <TrendingDown className="h-4 w-4" />
                          Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {analysisData.weaknesses.map((w, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-500" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {/* Right Column */}
              <div className="space-y-4 lg:col-span-2">
                {/* Issues */}
                <Card>
                  <CardHeader
                    className="flex cursor-pointer flex-row items-center justify-between"
                    onClick={() => toggleSection("issues")}
                  >
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Issues ({analysisData.issues?.length || 0})
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {expandedSections.has("issues") ? "−" : "+"}
                    </Button>
                  </CardHeader>
                  <AnimatePresence>
                    {expandedSections.has("issues") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <CardContent className="space-y-2 pt-0">
                          {analysisData.issues &&
                          analysisData.issues.length === 0 ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>No issues found!</span>
                            </div>
                          ) : (
                            analysisData.issues?.map((issue, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                {issue}
                              </div>
                            ))
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                {/* AI Suggestions */}
                {analysisData.suggestions &&
                  analysisData.suggestions.length > 0 && (
                    <Card>
                      <CardHeader
                        className="flex cursor-pointer flex-row items-center justify-between"
                        onClick={() => toggleSection("suggestions")}
                      >
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          AI Suggestions ({analysisData.suggestions.length})
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          {expandedSections.has("suggestions") ? "−" : "+"}
                        </Button>
                      </CardHeader>
                      <AnimatePresence>
                        {expandedSections.has("suggestions") && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <CardContent className="space-y-3 pt-0">
                              {analysisData.suggestions.map((s, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-lg border p-3"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <h4 className="text-sm font-semibold">
                                      {s.title}
                                    </h4>
                                    <div className="flex gap-1.5">
                                      <Badge
                                        variant="outline"
                                        className={
                                          s.priority === "HIGH"
                                            ? "text-rose-500"
                                            : s.priority === "MEDIUM"
                                              ? "text-amber-500"
                                              : "text-emerald-500"
                                        }
                                      >
                                        {s.priority} priority
                                      </Badge>
                                      <Badge variant="outline">
                                        {s.effort} effort
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground mt-1 text-sm">
                                    {s.description}
                                  </p>
                                </div>
                              ))}
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  )}

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analysisData.recommendations &&
                    analysisData.recommendations.length > 0 ? (
                      <ul className="space-y-2">
                        {analysisData.recommendations.map((rec, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-sm"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {idx + 1}
                            </span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No recommendations available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Save Dialog */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Deployment Report</DialogTitle>
              <DialogDescription>
                Save the current analysis as a named report for future
                reference.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="e.g., Sprint 15 Analysis"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultReport"
                  checked={isDefaultReport}
                  onChange={(e) => setIsDefaultReport(e.target.checked)}
                  className="border-muted-foreground h-4 w-4 rounded"
                />
                <Label
                  htmlFor="isDefaultReport"
                  className="text-sm font-normal"
                >
                  Set as default report
                </Label>
              </div>
              {savedReports.length > 0 && (
                <div className="bg-muted text-muted-foreground rounded-lg p-2 text-xs">
                  You have {savedReports.length} saved report
                  {savedReports.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveReport}
                disabled={saveReportMutation.isPending || !reportName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saveReportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default DeploymentPage;
