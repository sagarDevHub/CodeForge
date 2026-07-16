"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gauge, Lock, Cpu, Layers } from "lucide-react";
import type { AIAnalysis } from "./types";

interface DeploymentScoreCardsProps {
  analysis: AIAnalysis;
}

export function DeploymentScoreCards({ analysis }: DeploymentScoreCardsProps) {
  const scores = [
    { label: "Overall", value: analysis.score, icon: Gauge },
    { label: "Security", value: analysis.securityScore || 0, icon: Lock },
    { label: "Performance", value: analysis.performanceScore || 0, icon: Cpu },
    {
      label: "Maintainability",
      value: analysis.maintainabilityScore || 0,
      icon: Layers,
    },
  ];

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-emerald-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {scores.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <metric.icon className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground text-xs font-medium uppercase">
                {metric.label}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{metric.value}</span>
              <span className="text-muted-foreground text-xs">/100</span>
            </div>
            <Progress
              value={metric.value}
              className="mt-1 h-1.5"
              // @ts-ignore - Progress component may not have indicatorClassName
              indicatorClassName={getProgressColor(metric.value)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
