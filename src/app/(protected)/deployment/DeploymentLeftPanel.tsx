"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { AIAnalysis } from "./types";

interface DeploymentLeftPanelProps {
  analysis: AIAnalysis;
}

export function DeploymentLeftPanel({ analysis }: DeploymentLeftPanelProps) {
  return (
    <div className="space-y-4">
      {/* Stack */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="h-4 w-4" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {analysis.stack && analysis.stack.length > 0 ? (
              analysis.stack.map((item: string) => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {item}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">
                No stack detected
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              <TrendingUp className="h-4 w-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {analysis.strengths.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Weaknesses */}
      {analysis.weaknesses && analysis.weaknesses.length > 0 && (
        <Card className="border-rose-200 dark:border-rose-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-rose-600">
              <TrendingDown className="h-4 w-4" />
              Weaknesses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {analysis.weaknesses.map((w: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
