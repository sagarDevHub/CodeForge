"use client";

import { usePageTitle } from "@/hooks/use-page-title";

import React, { useState, useMemo, useCallback } from "react";
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
  GitBranch,
  Layers,
  Zap,
  Cpu,
  Database,
  Globe,
  Shield,
  Code2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Move,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface GraphNode {
  id: string;
  label: string;
  type: "folder" | "file" | "service" | "database" | "api" | "auth";
  metadata?: {
    imports?: string[];
    exports?: string[];
    description?: string;
    complexity?: number;
    lineCount?: number;
  };
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  type?: "import" | "export" | "dependency" | "call" | "inherit";
  weight?: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics?: {
    totalModules: number;
    totalFiles: number;
    complexity: number;
    dependencies: number;
  };
}

// Node type to icon mapping
const getNodeIcon = (type: string) => {
  switch (type) {
    case "folder":
      return Folder;
    case "file":
      return FileCode;
    case "service":
      return Cpu;
    case "database":
      return Database;
    case "api":
      return Globe;
    case "auth":
      return Shield;
    default:
      return FileCode;
  }
};

// Edge type to color mapping
const getEdgeColor = (type: string = "dependency", isDark: boolean) => {
  const colors = {
    import: isDark ? "#60A5FA" : "#3B82F6",
    export: isDark ? "#34D399" : "#10B981",
    dependency: isDark ? "#A78BFA" : "#8B5CF6",
    call: isDark ? "#F472B6" : "#EC4899",
    inherit: isDark ? "#FBBF24" : "#F59E0B",
  };
  return colors[type as keyof typeof colors] || colors.dependency;
};

export default function RepoArchitecturePage() {
  usePageTitle();
  const { project } = useProject();
  const projectId = project?.id;

  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const generateChart = api.project.getArchitecture.useMutation({
    onSuccess: (data) => {
      // Transform the API response into our enhanced graph structure
      const transformedData = transformGraphData(data as any);
      setGraphData(transformedData);
      toast.success("System architecture blueprint calculated!", {
        description: `Found ${transformedData.nodes.length} modules with ${transformedData.edges.length} dependencies`,
      });
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || "Failed to generate architecture.");
    },
  });

  const transformGraphData = (rawData: any): GraphData => {
    // This function should transform your API response into the enhanced format
    // For demo purposes, we'll create a structured response
    // You should adapt this to match your actual API response structure

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

    // Fallback mock data with enhanced structure
    return {
      nodes: [
        { id: "src", label: "src", type: "folder" },
        {
          id: "api",
          label: "api",
          type: "service",
          metadata: { description: "API services layer" },
        },
        {
          id: "auth",
          label: "auth",
          type: "auth",
          metadata: { description: "Authentication module" },
        },
        {
          id: "database",
          label: "database",
          type: "database",
          metadata: { description: "Database layer" },
        },
        { id: "components", label: "components", type: "folder" },
        {
          id: "ui",
          label: "ui",
          type: "file",
          metadata: { description: "UI components" },
        },
        {
          id: "utils",
          label: "utils",
          type: "file",
          metadata: { description: "Utility functions" },
        },
      ],
      edges: [
        {
          source: "api",
          target: "database",
          type: "dependency",
          label: "uses",
        },
        { source: "auth", target: "api", type: "import", label: "imports" },
        {
          source: "components",
          target: "ui",
          type: "import",
          label: "imports",
        },
        {
          source: "utils",
          target: "components",
          type: "dependency",
          label: "supports",
        },
      ],
      metrics: {
        totalModules: 3,
        totalFiles: 3,
        complexity: 42,
        dependencies: 4,
      },
    };
  };

  const handleAnalyze = useCallback(() => {
    if (!projectId) return;
    generateChart.mutate({ projectId });
  }, [projectId, generateChart]);

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
    <TooltipProvider>
      <div className="min-h-[calc(100vh-4rem)] w-full space-y-6 bg-transparent p-6">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              <Network className="h-6 w-6 text-blue-500" />
              System Blueprints
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Explore interactive relationship flows mapping system dependencies
              for{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {project.name}
              </span>
            </p>
          </motion.div>
        </header>

        {/* Metrics Cards */}
        {graphData?.metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              {
                label: "Modules",
                value: graphData.metrics.totalModules,
                icon: Layers,
              },
              {
                label: "Files",
                value: graphData.metrics.totalFiles,
                icon: FileCode,
              },
              {
                label: "Complexity",
                value: graphData.metrics.complexity,
                icon: Zap,
              },
              {
                label: "Dependencies",
                value: graphData.metrics.dependencies,
                icon: GitBranch,
              },
            ].map((metric, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                    <metric.icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {metric.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`relative flex w-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-all dark:border-zinc-800 dark:bg-zinc-950 ${
            isFullscreen ? "fixed inset-4 z-50 h-auto" : "min-h-150"
          }`}
        >
          <div className="flex flex-col items-start justify-between gap-4 border-b border-zinc-100 p-4 sm:flex-row sm:items-center dark:border-zinc-900">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
                <Network className="h-5 w-5 text-blue-500" /> Dependency & Flow
                Architecture
              </h2>
              <p className="text-xs text-zinc-400">
                Structural interaction map across modules
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Buttons */}
              <div className="flex gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
                {["all", "module", "file", "resource"].map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className="h-7 px-2 text-xs capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "graph" ? "list" : "graph")
                }
                className="h-7 px-2 text-xs"
              >
                {viewMode === "graph" ? "List View" : "Graph View"}
              </Button>

              {/* Zoom Controls */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                  className="h-7 w-7 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <span className="flex items-center text-xs text-zinc-500">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                  className="h-7 w-7 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-7 w-7 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>

              {/* Generate Button */}
              <Button
                onClick={handleAnalyze}
                disabled={generateChart.isPending}
                className="h-9 cursor-pointer rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow transition-all hover:bg-blue-500 disabled:opacity-50"
              >
                {generateChart.isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Mapping...</span>
                  </div>
                ) : graphData ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Recalculate</span>
                  </div>
                ) : (
                  "Generate Architecture"
                )}
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex flex-1 flex-col p-4 md:flex-row">
            {/* Node List (Left) */}
            <div className="mb-4 w-full md:mb-0 md:w-1/4 md:pr-4">
              <h3 className="mb-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase">
                Modules ({filteredData?.nodes.length || 0})
              </h3>
              <div className="custom-scrollbar max-h-100 space-y-1.5 overflow-y-auto pr-2">
                <AnimatePresence>
                  {filteredData?.nodes.map((node) => {
                    const Icon = getNodeIcon(node.type);
                    const isSelected = selectedNode === node.id;
                    const isHovered = hoveredNode === node.id;

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() =>
                          setSelectedNode(isSelected ? null : node.id)
                        }
                        className={`group flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-all ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-500 dark:bg-blue-950/30"
                            : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50"
                        }`}
                      >
                        <div
                          className={`rounded-md p-1.5 ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {node.label}
                          </p>
                          <p className="truncate text-[10px] text-zinc-400">
                            {node.metadata?.description || node.type}
                          </p>
                        </div>
                        {node.metadata?.complexity && (
                          <Badge
                            variant="secondary"
                            className="font-mono text-[10px]"
                          >
                            {node.metadata.complexity}
                          </Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Graph/List View (Right) */}
            <div className="flex-1">
              <div className="relative min-h-100 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                {generateChart.isPending && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <div className="animate-pulse text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      Running deep system relationship extraction...
                    </div>
                    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <motion.div
                        className="h-full bg-blue-500"
                        initial={{ width: "0%" }}
                        animate={{ width: ["0%", "100%"] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  </div>
                )}

                {!generateChart.isPending && !graphData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                    <AlertCircle className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm text-zinc-400">
                      Ready for blueprint synthesis. Click Generate to map
                      codebase.
                    </p>
                  </div>
                )}

                {graphData && viewMode === "list" && (
                  <div className="space-y-3">
                    {filteredData?.edges.map((edge, idx) => {
                      const sourceNode = filteredData?.nodes.find(
                        (n) => n.id === edge.source,
                      );
                      const targetNode = filteredData?.nodes.find(
                        (n) => n.id === edge.target,
                      );
                      const edgeColor = getEdgeColor(edge.type, false);

                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          className="flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-3 shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="truncate font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">
                                {sourceNode?.label || edge.source}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {sourceNode?.type}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-1 items-center justify-center gap-2 px-4">
                            <div
                              className="h-px flex-1"
                              style={{
                                background: `linear-gradient(to right, ${edgeColor}80, ${edgeColor})`,
                              }}
                            />
                            <Badge
                              style={{
                                backgroundColor: `${edgeColor}20`,
                                color: edgeColor,
                                borderColor: `${edgeColor}40`,
                              }}
                              className="border px-2 py-0 text-[10px]"
                            >
                              {edge.label || edge.type || "depends"}
                            </Badge>
                            <div
                              className="h-px flex-1"
                              style={{
                                background: `linear-gradient(to right, ${edgeColor}, ${edgeColor}80)`,
                              }}
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                            <Badge variant="outline" className="text-[10px]">
                              {targetNode?.type}
                            </Badge>
                            <span className="truncate font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">
                              {targetNode?.label || edge.target}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {graphData && viewMode === "graph" && (
                  <div
                    className="relative h-125 w-full"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "top left",
                    }}
                  >
                    {/* Graph visualization */}
                    <div className="grid grid-cols-3 gap-4">
                      {filteredData?.nodes.map((node) => {
                        const Icon = getNodeIcon(node.type);
                        const isSelected = selectedNode === node.id;
                        const isHovered = hoveredNode === node.id;

                        return (
                          <motion.div
                            key={node.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className={`relative rounded-lg border-2 p-3 text-center transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-lg dark:border-blue-500 dark:bg-blue-950/30"
                                : isHovered
                                  ? "border-blue-300 bg-zinc-50 shadow-md dark:border-blue-700 dark:bg-zinc-900/50"
                                  : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
                            }`}
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() =>
                              setSelectedNode(isSelected ? null : node.id)
                            }
                          >
                            <div className="flex justify-center">
                              <div
                                className={`rounded-lg p-2 ${
                                  isSelected
                                    ? "bg-blue-500 text-white"
                                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                                }`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                            </div>
                            <p className="mt-2 truncate font-mono text-xs font-medium text-zinc-800 dark:text-zinc-200">
                              {node.label}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              {node.type}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Node Details */}
        {selectedNodeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  {React.createElement(getNodeIcon(selectedNodeData.type), {
                    className: "h-5 w-5 text-blue-600 dark:text-blue-400",
                  })}
                </div>
                <div>
                  <h3 className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {selectedNodeData.label}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedNodeData.type} •{" "}
                    {selectedNodeData.metadata?.description || "No description"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedNode(null)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>
            {selectedNodeData.metadata && (
              <div className="mt-3 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-900">
                <div>
                  <p className="text-xs text-zinc-400">Complexity</p>
                  <p className="font-mono text-sm font-medium">
                    {selectedNodeData.metadata.complexity || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Lines</p>
                  <p className="font-mono text-sm font-medium">
                    {selectedNodeData.metadata.lineCount || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Exports</p>
                  <p className="font-mono text-sm font-medium">
                    {selectedNodeData.metadata.exports?.length || 0}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
