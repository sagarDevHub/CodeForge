"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AIAnalysis } from "./types";

interface DeploymentRightPanelProps {
  analysis: AIAnalysis;
}

export function DeploymentRightPanel({ analysis }: DeploymentRightPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["issues", "suggestions"]),
  );

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) newSet.delete(section);
    else newSet.add(section);
    setExpandedSections(newSet);
  };

  return (
    <div className="space-y-4 lg:col-span-2">
      {/* Issues */}
      <Card>
        <CardHeader
          className="flex cursor-pointer flex-row items-center justify-between"
          onClick={() => toggleSection("issues")}
        >
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Issues ({analysis.issues?.length || 0})
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            {expandedSections.has("issues") ? "−" : "+"}
          </Button>
        </CardHeader>
        <AnimatePresence>
          {expandedSections.has("issues") && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent className="space-y-2 pt-0">
                {analysis.issues && analysis.issues.length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>No issues found!</span>
                  </div>
                ) : (
                  analysis.issues?.map((issue: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{issue}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* AI Suggestions */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <Card>
          <CardHeader
            className="flex cursor-pointer flex-row items-center justify-between"
            onClick={() => toggleSection("suggestions")}
          >
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-purple-500" />
              AI Suggestions ({analysis.suggestions.length})
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {expandedSections.has("suggestions") ? "−" : "+"}
            </Button>
          </CardHeader>
          <AnimatePresence>
            {expandedSections.has("suggestions") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CardContent className="space-y-3 pt-0">
                  {analysis.suggestions.map((s, idx) => (
                    <div key={idx} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold">{s.title}</h4>
                        <div className="flex gap-1.5">
                          <Badge
                            variant="outline"
                            className={
                              s.priority === "HIGH"
                                ? "text-rose-500"
                                : s.priority === "MEDIUM"
                                  ? "text-amber-500"
                                  : "text-emerald-500"
                            }
                          >
                            {s.priority} priority
                          </Badge>
                          <Badge variant="outline">{s.effort} effort</Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {s.description}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.recommendations && analysis.recommendations.length > 0 ? (
            <ul className="space-y-2">
              {analysis.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              No recommendations available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
