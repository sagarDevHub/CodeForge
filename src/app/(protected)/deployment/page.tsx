"use client";

import React from "react";
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
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

// Explicitly type incoming mutations to prevent any layout shifts
interface ProgressMetrics {
  score: number;
  stack: string[];
  issues: string[];
  recommendations: string[];
}

const DeploymentCard = () => {
  const { project } = useProject();
  const projectId = project?.id;

  const mutation = api.project.checkDeployment.useMutation({
    onSuccess: () => {
      toast.success("Ecosystem compilation trace completed successfully!");
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || "Ecosystem health audit run failed.");
    },
  });

  const data = mutation.data as ProgressMetrics | undefined;

  // Compute dynamic scoring visual configurations
  const getScoreTier = (score: number) => {
    if (score >= 90)
      return {
        text: "text-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        label: "Production Ready",
      };
    if (score >= 70)
      return {
        text: "text-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        label: "Warning Threshold",
      };
    return {
      text: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      label: "Critical Vulnerabilities",
    };
  };

  const scoreTier = data ? getScoreTier(data.score) : null;

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 shadow-sm backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/40">
      {/* Visual Ambient Decorative Top-Right Mesh Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/5" />

      <CardHeader className="flex flex-col justify-between gap-4 border-b border-zinc-100 pb-5 sm:flex-row sm:items-center dark:border-zinc-900">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            <ShieldCheck className="h-5 w-5 text-[#0A66FF] dark:text-blue-400" />
            Deployment Readiness Check
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            Audit system code patterns, configurations, and environment state
            metrics.
          </CardDescription>
        </div>

        <Button
          onClick={() => {
            if (!projectId) {
              toast.error(
                "Please pick an active codebase repository from the menu loop.",
              );
              return;
            }
            mutation.mutate({ projectId });
          }}
          disabled={mutation.isPending}
          className="flex h-9 w-full shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#0A66FF] px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/10 transition-all hover:bg-[#0A66FF]/90 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Analyzing Vectors...</span>
            </>
          ) : data ? (
            <>
              <span>Re-Run Audit</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </>
          ) : (
            "Scan Infrastructure"
          )}
        </Button>
      </CardHeader>

      <CardContent className="pt-6">
        {/* State A: Complete Empty Canvas State */}
        {!mutation.isPending && !data && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900/10">
            <Terminal className="mb-3 h-8 w-8 text-zinc-400 dark:text-zinc-600" />
            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Ready to execute codebase audit pipeline
            </p>
            <p className="mt-0.5 max-w-xs text-[11px] text-zinc-400">
              Click the scan action above to query your directory map against
              production best practices.
            </p>
          </div>
        )}

        {/* State B: Loading Status feedback placeholder */}
        {mutation.isPending && (
          <div className="flex flex-col items-center justify-center space-y-3 py-16 text-center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-10 w-10 animate-ping rounded-full border-2 border-blue-500/20" />
              <Loader2 className="h-6 w-6 animate-spin text-[#0A66FF]" />
            </div>
            <div className="space-y-0.5">
              <p className="animate-pulse text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Running architectural linter rules...
              </p>
              <p className="max-w-xs text-[10px] text-zinc-400">
                Inspecting health configurations, continuous integration, and
                schema triggers.
              </p>
            </div>
          </div>
        )}

        {/* State C: Modern Report Render Loop */}
        {data && !mutation.isPending && (
          <div className="animate-in fade-in grid grid-cols-1 gap-6 duration-300 md:grid-cols-12">
            {/* Left Metrics Telemetry Gauge Panel */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50/40 p-5 text-center md:col-span-4 dark:border-zinc-900 dark:bg-zinc-900/20">
              <span className="mb-4 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                Deployment Score
              </span>

              {/* Score Circular Badge display */}
              <div
                className={`relative flex h-28 w-28 flex-col items-center justify-center rounded-full border border-current shadow-inner ${scoreTier?.text} ${scoreTier?.bg} ${scoreTier?.border}`}
              >
                <span className="font-mono text-4xl font-black tracking-tighter">
                  {data.score}
                </span>
                <span className="mt-0.5 text-[10px] font-bold opacity-60">
                  / 100
                </span>
              </div>

              <div
                className={`mt-4 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${scoreTier?.text} ${scoreTier?.bg} ${scoreTier?.border}`}
              >
                {scoreTier?.label}
              </div>

              {/* Stack Block */}
              <div className="mt-6 w-full border-t border-zinc-100 pt-4 text-left dark:border-zinc-900">
                <span className="mb-2 flex items-center gap-1 text-[9px] font-bold tracking-wider text-zinc-400 uppercase">
                  <Layers className="h-3 w-3" /> Identified Ecosystem Stack
                </span>
                <div className="flex flex-wrap gap-1">
                  {data.stack.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-zinc-200/60 bg-white px-2 py-0.5 font-mono text-[10px] font-medium text-zinc-600 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Actionable Risk Context Section */}
            <div className="flex flex-col justify-between space-y-5 md:col-span-8">
              {/* Issues Block */}
              <div className="space-y-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Risks
                  & Integrity Checkpoints
                </span>

                <div className="custom-scrollbar max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  {data.issues.length > 0 ? (
                    data.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-700 dark:border-zinc-900 dark:bg-zinc-900/30 dark:text-zinc-300"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        <span className="leading-relaxed">{issue}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Zero optimization vulnerabilities found. Perfect
                        structural hygiene.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations Block */}
              <div className="space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-900">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500" /> Actionable
                  Mitigations
                </span>

                <div className="custom-scrollbar max-h-40 space-y-1.5 overflow-y-auto pr-1">
                  {data.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-white p-2.5 text-xs font-medium text-zinc-600 dark:border-zinc-900/50 dark:bg-zinc-900 dark:text-zinc-400"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-500/10 font-mono text-[10px] font-bold text-[#0A66FF] dark:text-blue-400">
                        {idx + 1}
                      </div>
                      <span className="truncate">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeploymentCard;
