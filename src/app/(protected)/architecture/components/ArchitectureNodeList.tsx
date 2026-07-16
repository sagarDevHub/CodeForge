"use client";

import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FileCode, Cpu, Database, Globe, Shield } from "lucide-react";
import type { GraphNode } from "../types";

interface ArchitectureNodeListProps {
  nodes: GraphNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
  isLoading: boolean;
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

export function ArchitectureNodeList({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  onNodeSelect,
  onNodeHover,
  isLoading,
}: ArchitectureNodeListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="text-sm text-zinc-500">Loading modules...</span>
      </div>
    );
  }

  return (
    <div className="custom-scrollbar max-h-62.5 space-y-1.5 overflow-y-auto pr-1 sm:max-h-87.5 sm:pr-2 lg:max-h-112.5">
      <AnimatePresence>
        {nodes.map((node) => {
          const Icon = getNodeIcon(node.type);
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          return (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => onNodeHover(node.id)}
              onMouseLeave={() => onNodeHover(null)}
              onClick={() => onNodeSelect(node.id)}
              className={`group flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-sm dark:border-blue-500 dark:bg-blue-950/30"
                  : "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/50"
              }`}
            >
              <div
                className={`rounded-md p-1 ${
                  isSelected
                    ? "bg-blue-500 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[10px] font-medium text-zinc-800 sm:text-xs dark:text-zinc-200">
                  {node.label}
                </p>
                <p className="truncate text-[8px] text-zinc-400 sm:text-[10px]">
                  {node.metadata?.description || node.type}
                </p>
              </div>
              {node.metadata?.complexity && (
                <Badge
                  variant="secondary"
                  className="font-mono text-[8px] sm:text-[10px]"
                >
                  {node.metadata.complexity}
                </Badge>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
