"use client";

import { motion } from "framer-motion";
import { Folder, FileCode, Cpu, Database, Globe, Shield } from "lucide-react";
import type { GraphNode } from "../types";

interface ArchitectureGraphViewProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  zoomLevel: number;
  onNodeSelect: (id: string) => void;
  onNodeHover: (id: string | null) => void;
}

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
        className="grid grid-cols-3 gap-4 p-2"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "top left",
        }}
      >
        {nodes.map((node) => {
          const Icon = getNodeIcon(node.type);
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

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
              onMouseEnter={() => onNodeHover(node.id)}
              onMouseLeave={() => onNodeHover(null)}
              onClick={() => onNodeSelect(node.id)}
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
              <p className="text-[10px] text-zinc-400">{node.type}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
