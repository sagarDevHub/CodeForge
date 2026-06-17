"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import {
  Network,
  Loader2,
  RefreshCw,
  AlertCircle,
  Workflow,
  Folder,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface GraphData {
  nodes: Array<{ id: string; label: string; type: "folder" | "file" }>;
  edges: Array<{ source: string; target: string; label?: string }>;
}

export default function RepoArchitecturePage() {
  const { project } = useProject();
  const projectId = project?.id;

  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const generateChart = api.project.getArchitecture.useMutation({
    onSuccess: (data) => {
      setGraphData(data as GraphData);
      toast.success("System architecture blueprint calculated!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to generate architecture.");
    },
  });

  const handleAnalyze = () => {
    if (!projectId) return;
    generateChart.mutate({ projectId });
  };

  if (!projectId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center p-6 text-center">
        <Workflow className="mb-3 h-12 w-12 animate-pulse text-zinc-400 dark:text-zinc-600" />
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          No Active Project Selected
        </h1>
        <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Select a workspace repository from the sidebar to analyze its system
          blueprint.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full space-y-6 bg-transparent p-6">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          System Blueprints
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Explore interactive relationship flows mapping system dependencies for{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {project.name}
          </span>
        </p>
      </header>

      {/* Main Panel */}
      <div className="flex min-h-125 w-full flex-col rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center dark:border-zinc-900">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              <Network className="h-5 w-5 text-blue-500" /> Dependency & Flow
              Architecture
            </h2>
            <p className="text-xs text-zinc-400">
              Structural interaction map across modules
            </p>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={generateChart.isPending}
            className="h-9 w-full cursor-pointer rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow transition-all hover:bg-blue-500 disabled:opacity-50 sm:w-auto"
          >
            {generateChart.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mapping Infrastructure...</span>
              </div>
            ) : graphData ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Recalculate Diagram</span>
              </div>
            ) : (
              "Generate Architecture View"
            )}
          </Button>
        </div>

        {/* Display Canvas Canvas */}
        <div className="flex min-h-100 flex-1 flex-col items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50/50 p-6 dark:border-zinc-900/40">
          {generateChart.isPending && (
            <div className="flex flex-col items-center gap-2 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <div className="animate-pulse text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Running deep system relationship extraction...
              </div>
            </div>
          )}

          {!generateChart.isPending && !graphData && (
            <div className="flex flex-col items-center gap-2 text-center font-mono text-xs text-zinc-400">
              <AlertCircle className="h-5 w-5 text-zinc-300 dark:text-zinc-700" />
              <span>
                Ready for blueprint synthesis. Click button above to map
                codebase.
              </span>
            </div>
          )}

          {/* 🌟 TRUE VISUAL FLOW LAYOUT RENDERING */}
          {graphData && (
            <div className="flex h-full w-full flex-col items-start gap-8 md:flex-row">
              {/* Left Column: Component Systems Nodes */}
              <div className="w-full space-y-3 md:w-1/3">
                <h3 className="mb-2 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Detected Modules
                </h3>
                <div className="custom-scrollbar max-h-87.5 space-y-2 overflow-y-auto pr-2">
                  {graphData.nodes?.map((node) => (
                    <div
                      key={node.id}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 text-zinc-800 shadow-sm transition-transform hover:scale-[1.01] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                    >
                      {node.type === "folder" ? (
                        <Folder className="h-4 w-4 shrink-0 text-blue-500" />
                      ) : (
                        <FileCode className="h-4 w-4 shrink-0 text-emerald-500" />
                      )}
                      <span className="truncate font-mono text-xs font-medium">
                        {node.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Directional Architecture Interactions */}
              <div className="min-h-87.5 w-full flex-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-inner md:w-2/3 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                  Structural Dependencies
                </h3>

                {graphData.edges && graphData.edges.length > 0 ? (
                  <div className="custom-scrollbar max-h-80 space-y-3 overflow-y-auto pr-2">
                    {graphData.edges.map((edge, index) => {
                      const sourceNode = graphData.nodes.find(
                        (n) => n.id === edge.source || n.label === edge.source,
                      );
                      const targetNode = graphData.nodes.find(
                        (n) => n.id === edge.target || n.label === edge.target,
                      );

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-zinc-100 bg-zinc-50 p-2.5 font-mono text-xs dark:border-zinc-900/60 dark:bg-zinc-950"
                        >
                          <div className="flex max-w-[40%] items-center gap-2 truncate">
                            {sourceNode?.type === "folder" ? (
                              <Folder className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                            ) : (
                              <FileCode className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            )}
                            <span className="truncate font-semibold text-zinc-700 dark:text-zinc-300">
                              {sourceNode?.label || edge.source}
                            </span>
                          </div>

                          <div className="flex flex-1 flex-col items-center px-4">
                            <span className="mb-0.5 max-w-30 truncate font-sans text-[10px] text-zinc-400">
                              {edge.label || "imports / targets"}
                            </span>
                            <div className="flex w-full items-center justify-center gap-1">
                              <div className="h-0.5 flex-1 border-t border-dashed bg-zinc-200 dark:bg-zinc-800"></div>
                              <ArrowRight className="h-3 w-3 shrink-0 text-blue-500" />
                            </div>
                          </div>

                          <div className="flex max-w-[40%] items-center justify-end gap-2 truncate">
                            <span className="truncate text-zinc-600 dark:text-zinc-400">
                              {targetNode?.label || edge.target}
                            </span>
                            {targetNode?.type === "folder" ? (
                              <Folder className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                            ) : (
                              <FileCode className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-12 text-center text-xs text-zinc-400 italic">
                    System topology synthesized isolated node entities. No
                    distinct architectural edges returned by LLM reasoning loop.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
