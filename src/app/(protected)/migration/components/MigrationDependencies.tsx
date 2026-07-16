"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowRight, AlertCircle } from "lucide-react";
import type { MigrationDependency } from "../types";
import { cn } from "@/lib/utils";

interface MigrationDependenciesProps {
  dependencies: MigrationDependency[];
}

export function MigrationDependencies({
  dependencies,
}: MigrationDependenciesProps) {
  if (!dependencies || dependencies.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center">
          <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No dependencies to update
        </CardContent>
      </Card>
    );
  }

  const getRiskLevel = (reason: string) => {
    if (reason.toLowerCase().includes("security")) return "high";
    if (reason.toLowerCase().includes("breaking")) return "high";
    if (reason.toLowerCase().includes("major")) return "medium";
    if (reason.toLowerCase().includes("minor")) return "low";
    return "medium";
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Package className="h-4 w-4" />
          Dependencies to Update
          <Badge variant="secondary" className="ml-2">
            {dependencies.length} packages
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {dependencies.map((dep, idx) => {
          const riskLevel = getRiskLevel(dep.reason);
          return (
            <div
              key={idx}
              className="flex flex-col items-start justify-between gap-3 rounded-lg border p-3 transition-shadow hover:shadow-sm sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2">
                <Package className="text-muted-foreground h-4 w-4" />
                <span className="font-mono text-sm font-medium">
                  {dep.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-red-500 line-through">
                  {dep.from}
                </span>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
                <span className="font-mono text-sm font-medium text-green-500">
                  {dep.to}
                </span>
                <Badge className={cn("text-[10px]", getRiskColor(riskLevel))}>
                  {riskLevel.toUpperCase()} risk
                </Badge>
              </div>

              <span className="text-muted-foreground flex-1 text-xs sm:text-right">
                {dep.reason}
              </span>
            </div>
          );
        })}

        <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900/30 dark:bg-yellow-950/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              <span className="font-medium">Note:</span> Always test dependency
              updates in a development environment before deploying to
              production.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
