"use client";

import { Network } from "lucide-react";
import { motion } from "framer-motion";

interface ArchitectureHeaderProps {
  projectName: string;
}

export function ArchitectureHeader({ projectName }: ArchitectureHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl dark:text-zinc-50">
          <Network className="h-5 w-5 text-blue-500 sm:h-6 sm:w-6" />
          System Blueprints
        </h1>
        <p className="text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
          Explore interactive relationship flows mapping system dependencies for{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {projectName}
          </span>
        </p>
      </motion.div>
    </header>
  );
}
