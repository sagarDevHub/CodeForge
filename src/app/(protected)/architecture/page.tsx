"use client";

import { usePageTitle } from "@/hooks/use-page-title";

import React, { useState, useMemo, useCallback } from "react";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
// import {
//   ArchitectureHeader,
//   ArchitectureMetrics,
//   ArchitectureNodeList,
//   ArchitectureGraphView,
//   ArchitectureListView,
//   ArchitectureNodeDetails,
//   ArchitectureLoadingState,
//   ArchitectureEmptyState,
//   ArchitectureToolbar,
//   ArchitectureFilters,
// } from "@/components";
import type { FilterType, GraphData, ViewMode } from "./types";
import { ArchitectureEmptyState } from "./components/ArchitectureEmptyState";
import { ArchitectureHeader } from "./components/ArchitectureHeader";
import { ArchitectureMetrics } from "./components/ArchitectureMetrics";
import { ArchitectureFilters } from "./components/ArchitectureFilters";
import { ArchitectureToolbar } from "./components/ArchitectureToolbar";
import { ArchitectureNodeList } from "./components/ArchitectureNodeList";
import { ArchitectureLoadingState } from "./components/ArchitectureLoadingState";
import { ArchitectureListView } from "./components/ArchitectureListView";
import { ArchitectureGraphView } from "./components/ArchitectureGraphView";
import { ArchitectureNodeDetails } from "./components/ArchitectureNodeDetails";

export default function RepoArchitecturePage() {
  usePageTitle();
  const { project } = useProject();
  const projectId = project?.id;

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("graph");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // ✅ Use the cached query
  const {
    data: architectureData,
    refetch,
    isLoading,
    isFetching,
  } = api.architecture.getArchitecture.useQuery(
    { projectId: projectId! },
    {
      enabled: !!projectId,
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  // ✅ Invalidate cache mutation
  const invalidateCache = api.architecture.invalidateArchitecture.useMutation({
    onSuccess: () => {
      toast.success("Cache invalidated, refreshing data...");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to invalidate cache");
    },
  });

  const transformGraphData = useCallback((rawData: any): GraphData => {
    if (rawData && rawData.nodes && rawData.edges) {
      return {
        nodes: rawData.nodes.map((node: any) => ({
          ...node,
          metadata: {
            ...node.metadata,
            complexity: Math.floor(Math.random() * 10) + 1,
            lineCount: Math.floor(Math.random() * 500) + 50,
          },
        })),
        edges: rawData.edges,
        metrics: {
          totalModules: rawData.nodes.filter((n: any) => n.type === "folder")
            .length,
          totalFiles: rawData.nodes.filter((n: any) => n.type === "file")
            .length,
          complexity: Math.floor(Math.random() * 100) + 50,
          dependencies: rawData.edges.length,
        },
      };
    }
    return {
      nodes: [],
      edges: [],
      metrics: {
        totalModules: 0,
        totalFiles: 0,
        complexity: 0,
        dependencies: 0,
      },
    };
  }, []);

  const graphData = useMemo(() => {
    if (!architectureData) return null;
    return transformGraphData(architectureData);
  }, [architectureData, transformGraphData]);

  const handleRefresh = useCallback(() => {
    if (!projectId) return;
    refetch();
    toast.info("Refreshing architecture data...");
  }, [projectId, refetch]);

  const handleClearCache = useCallback(() => {
    if (!projectId) return;
    invalidateCache.mutate({ projectId });
  }, [projectId, invalidateCache]);

  const filteredData = useMemo(() => {
    if (!graphData) return null;
    if (filterType === "all") return graphData;

    const filteredNodes = graphData.nodes.filter((node) => {
      if (filterType === "module")
        return node.type === "folder" || node.type === "service";
      if (filterType === "file") return node.type === "file";
      if (filterType === "resource")
        return ["database", "api", "auth"].includes(node.type);
      return true;
    });

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = graphData.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );

    return { ...graphData, nodes: filteredNodes, edges: filteredEdges };
  }, [graphData, filterType]);

  const selectedNodeData = useMemo(() => {
    if (!selectedNode || !graphData) return null;
    return graphData.nodes.find((node) => node.id === selectedNode);
  }, [selectedNode, graphData]);

  // Loading states
  if (!projectId) {
    return <ArchitectureEmptyState />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-[calc(100vh-4rem)] w-full space-y-6 bg-transparent p-4 sm:p-6">
        {/* Header */}
        <ArchitectureHeader projectName={project.name} />

        {/* Metrics Cards */}
        {graphData?.metrics && (
          <ArchitectureMetrics
            totalModules={graphData.metrics.totalModules}
            totalFiles={graphData.metrics.totalFiles}
            complexity={graphData.metrics.complexity}
            dependencies={graphData.metrics.dependencies}
          />
        )}

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`relative flex w-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-950 ${
            isFullscreen ? "fixed inset-4 z-50 h-auto" : "min-h-125"
          }`}
        >
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-zinc-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 dark:border-zinc-900">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-zinc-900 sm:text-lg dark:text-zinc-50">
                <span className="text-blue-500">📊</span>
                Dependency & Flow Architecture
              </h2>
              <p className="text-[10px] text-zinc-400 sm:text-xs">
                Structural interaction map across modules
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {/* Filters */}
              <ArchitectureFilters
                filterType={filterType}
                onFilterChange={setFilterType}
              />

              {/* Toolbar */}
              <ArchitectureToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                zoomLevel={zoomLevel}
                onZoomIn={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                onZoomOut={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                isFullscreen={isFullscreen}
                onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
                onRefresh={handleRefresh}
                onClearCache={handleClearCache}
                isLoading={isFetching}
                isInvalidating={invalidateCache.isPending}
                hasData={!!graphData}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col p-3 sm:p-4 lg:flex-row lg:gap-4">
            {/* Node List (Left) */}
            <div className="w-full lg:w-1/4">
              <h3 className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase sm:mb-3 sm:text-xs">
                Modules ({filteredData?.nodes.length || 0})
              </h3>
              <ArchitectureNodeList
                nodes={filteredData?.nodes || []}
                selectedNodeId={selectedNode}
                hoveredNodeId={hoveredNode}
                onNodeSelect={(id: string) =>
                  setSelectedNode(selectedNode === id ? null : id)
                }
                onNodeHover={setHoveredNode}
                isLoading={isLoading}
              />
            </div>

            {/* Graph/List View (Right) */}
            <div className="mt-4 w-full flex-1 lg:mt-0">
              <div className="relative min-h-75 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 sm:min-h-100 sm:p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                {isLoading ? (
                  <ArchitectureLoadingState />
                ) : !graphData ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center sm:gap-3">
                    <span className="text-4xl">📋</span>
                    <p className="text-xs text-zinc-400 sm:text-sm">
                      Ready for blueprint synthesis. Click Refresh to map
                      codebase.
                    </p>
                  </div>
                ) : viewMode === "list" ? (
                  <ArchitectureListView
                    edges={filteredData?.edges || []}
                    nodes={filteredData?.nodes || []}
                  />
                ) : (
                  <ArchitectureGraphView
                    nodes={filteredData?.nodes || []}
                    selectedNodeId={selectedNode}
                    hoveredNodeId={hoveredNode}
                    zoomLevel={zoomLevel}
                    onNodeSelect={(id: string) =>
                      setSelectedNode(selectedNode === id ? null : id)
                    }
                    onNodeHover={setHoveredNode}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Node Details */}
        {selectedNodeData && (
          <ArchitectureNodeDetails
            node={selectedNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
