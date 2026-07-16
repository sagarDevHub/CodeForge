"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";
import type { AIAnalysis } from "./types";

interface DeploymentSummaryProps {
  analysis: AIAnalysis;
  getRiskColor: (risk: string) => string;
}

export function DeploymentSummary({
  analysis,
  getRiskColor,
}: DeploymentSummaryProps) {
  return (
    <Card className="border-blue-200 dark:border-blue-900">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Brain className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">AI Executive Summary</h3>
              <Badge variant="outline" className="text-xs">
                Confidence: {Math.round(analysis.confidence || 0)}%
              </Badge>
              <Badge className={getRiskColor(analysis.riskLevel)}>
                Risk: {analysis.riskLevel}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {analysis.summary}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
