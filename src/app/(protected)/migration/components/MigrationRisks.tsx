"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MigrationRisk } from "../types";

interface MigrationRisksProps {
  risks: MigrationRisk[];
}

export function MigrationRisks({ risks }: MigrationRisksProps) {
  if (!risks || risks.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-center">
          <Shield className="mx-auto mb-2 h-8 w-8 opacity-50" />
          No risks identified
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900/30";
      case "medium":
        return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/30";
      case "high":
        return "text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/30";
      case "critical":
        return "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-900/30";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <Info className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      case "critical":
        return "Critical";
      default:
        return "Unknown";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Shield className="h-4 w-4" />
          Risk Assessment
          <Badge variant="secondary" className="ml-2">
            {risks.length} risks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk, idx) => (
          <div
            key={idx}
            className={cn("rounded-lg border p-4", getRiskColor(risk.level))}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">{getRiskIcon(risk.level)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {getRiskLabel(risk.level)}
                  </Badge>
                  <p className="text-sm font-medium">{risk.description}</p>
                </div>
                {risk.mitigation && (
                  <div className="bg-background/50 mt-2 rounded p-2">
                    <p className="text-muted-foreground text-xs">
                      <span className="font-medium">Mitigation:</span>{" "}
                      {risk.mitigation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
