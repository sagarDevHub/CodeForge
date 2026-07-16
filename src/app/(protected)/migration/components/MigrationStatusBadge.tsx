"use client";

import { cn } from "@/lib/utils";

interface MigrationStatusBadgeProps {
  status: string;
}

export function MigrationStatusBadge({ status }: MigrationStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500";
      case "ready":
        return "bg-blue-500";
      case "in_progress":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "rolled_back":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium text-white",
        getStatusColor(status),
      )}
    >
      {status.toUpperCase()}
    </span>
  );
}
