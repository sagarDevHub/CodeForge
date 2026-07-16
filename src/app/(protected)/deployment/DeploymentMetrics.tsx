"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DeploymentMetricsProps {
  overall: number;
  security: number;
  performance: number;
  maintainability: number;
}

export function DeploymentMetrics({
  overall,
  security,
  performance,
  maintainability,
}: DeploymentMetricsProps) {
  const metrics = [
    { label: "Overall", value: overall, color: "text-blue-500" },
    { label: "Security", value: security, color: "text-rose-500" },
    { label: "Performance", value: performance, color: "text-emerald-500" },
    {
      label: "Maintainability",
      value: maintainability,
      color: "text-purple-500",
    },
  ];

  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-emerald-500";
    if (value >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
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
              indicatorClassName={getProgressColor(metric.value)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
