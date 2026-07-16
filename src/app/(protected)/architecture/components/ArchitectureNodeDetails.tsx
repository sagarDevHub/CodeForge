"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Folder, FileCode, Cpu, Database, Globe, Shield } from "lucide-react";
import type { GraphNode } from "../types";

interface ArchitectureNodeDetailsProps {
  node: GraphNode;
  onClose: () => void;
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

export function ArchitectureNodeDetails({
  node,
  onClose,
}: ArchitectureNodeDetailsProps) {
  const Icon = getNodeIcon(node.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2 dark:bg-blue-900/30">
            <Icon className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-zinc-900 sm:text-base dark:text-zinc-50">
              {node.label}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {node.type} • {node.metadata?.description || "No description"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 self-end p-0 sm:h-7 sm:w-7 sm:self-auto"
        >
          ✕
        </Button>
      </div>
      {node.metadata && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 sm:grid-cols-3 sm:gap-3 dark:border-zinc-900">
          <div>
            <p className="text-[10px] text-zinc-400 sm:text-xs">Complexity</p>
            <p className="font-mono text-xs font-medium sm:text-sm">
              {node.metadata.complexity || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-zinc-400 sm:text-xs">Lines</p>
            <p className="font-mono text-xs font-medium sm:text-sm">
              {node.metadata.lineCount || "N/A"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[10px] text-zinc-400 sm:text-xs">Exports</p>
            <p className="font-mono text-xs font-medium sm:text-sm">
              {node.metadata.exports?.length || 0}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
