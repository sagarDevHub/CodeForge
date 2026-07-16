"use client";

import { motion } from "framer-motion";
import type { GraphNode } from "../types";

interface ArchitectureGraphViewProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  zoomLevel: number;
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

const getNodeIcon = (type: string) => {
  // Import icons or use emojis for simplicity
  switch (type) {
    case "folder":
      return "📁";
    case "file":
      return "📄";
    case "service":
      return "⚙️";
    case "database":
      return "🗄️";
    case "api":
      return "🌐";
    case "auth":
      return "🔒";
    default:
      return "📄";
  }
};

export function ArchitectureGraphView({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  zoomLevel,
  onNodeSelect,
  onNodeHover,
}: ArchitectureGraphViewProps) {
  return (
    <div className="w-full overflow-auto">
      <div
        className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
        }}
      >
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className={`relative min-w-20 rounded-lg border-2 p-2 text-center transition-all sm:p-3 ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-lg dark:border-blue-500 dark:bg-blue-950/30"
                  : isHovered
                    ? "border-blue-300 bg-zinc-50 shadow-md dark:border-blue-700 dark:bg-zinc-900/50"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
              onMouseEnter={() => onNodeHover(node.id)}
              onMouseLeave={() => onNodeHover(null)}
              onClick={() => onNodeSelect(node.id)}
            >
              <div className="flex justify-center">
                <div
                  className={`rounded-lg p-1.5 sm:p-2 ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xl sm:text-2xl">
                    {getNodeIcon(node.type)}
                  </span>
                </div>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] font-medium text-zinc-800 sm:mt-2 sm:text-xs dark:text-zinc-200">
                {node.label}
              </p>
              <p className="text-[8px] text-zinc-400 sm:text-[10px]">
                {node.type}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
