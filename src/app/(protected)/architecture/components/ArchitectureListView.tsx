"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { GraphEdge, GraphNode } from "../types";

interface ArchitectureListViewProps {
  edges: GraphEdge[];
  nodes: GraphNode[];
}

const getEdgeColor = (type: string = "dependency") => {
  const colors = {
    import: "#3B82F6",
    export: "#10B981",
    dependency: "#8B5CF6",
    call: "#EC4899",
    inherit: "#F59E0B",
  };
  return colors[type as keyof typeof colors] || colors.dependency;
};

export function ArchitectureListView({
  edges,
  nodes,
}: ArchitectureListViewProps) {
  return (
    <div className="max-h-100 space-y-2 overflow-y-auto sm:max-h-125 sm:space-y-3">
      {edges.map((edge, idx) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        const edgeColor = getEdgeColor(edge.type);

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
            className="flex flex-col gap-1 rounded-lg border border-zinc-100 bg-white p-2 shadow-sm hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-3 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="truncate font-mono text-xs font-medium text-zinc-800 sm:text-sm dark:text-zinc-200">
                  {sourceNode?.label || edge.source}
                </span>
                <Badge variant="outline" className="text-[8px] sm:text-[10px]">
                  {sourceNode?.type}
                </Badge>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center gap-1 px-1 sm:gap-2 sm:px-4">
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
                className="border px-1 py-0 text-[8px] sm:px-2 sm:text-[10px]"
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

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2">
              <Badge variant="outline" className="text-[8px] sm:text-[10px]">
                {targetNode?.type}
              </Badge>
              <span className="truncate font-mono text-xs font-medium text-zinc-800 sm:text-sm dark:text-zinc-200">
                {targetNode?.label || edge.target}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
