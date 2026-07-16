"use client";

import { motion } from "framer-motion";
import { Layers, FileCode, Zap, GitBranch } from "lucide-react";

interface ArchitectureMetricsProps {
  totalModules: number;
  totalFiles: number;
  complexity: number;
  dependencies: number;
}

export function ArchitectureMetrics({
  totalModules,
  totalFiles,
  complexity,
  dependencies,
}: ArchitectureMetricsProps) {
  const metrics = [
    { label: "Modules", value: totalModules, icon: Layers },
    { label: "Files", value: totalFiles, icon: FileCode },
    { label: "Complexity", value: complexity, icon: Zap },
    { label: "Dependencies", value: dependencies, icon: GitBranch },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4"
    >
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-blue-100 p-1.5 sm:p-2 dark:bg-blue-900/30">
              <metric.icon className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-medium text-zinc-500 sm:text-xs dark:text-zinc-400">
                {metric.label}
              </p>
              <p className="text-lg font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
                {metric.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
