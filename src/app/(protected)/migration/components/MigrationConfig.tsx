"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  GitBranch,
  Loader2,
  Rocket,
  Code2,
  Zap,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type {
  MigrationType,
  DetectedStack,
  MigrationSuggestion,
} from "../types";

interface MigrationConfigProps {
  onAnalyze: (type: MigrationType, target: string) => void;
  isAnalyzing: boolean;
  projectId: string;
}

const migrationTypes = [
  { value: "framework", label: "Framework Upgrade", icon: Rocket },
  { value: "language", label: "Language Migration", icon: Code2 },
  { value: "architecture", label: "Architecture Change", icon: GitBranch },
  { value: "refactor", label: "Code Refactoring", icon: Zap },
];

export function MigrationConfig({
  onAnalyze,
  isAnalyzing,
  projectId,
}: MigrationConfigProps) {
  const [selectedType, setSelectedType] = useState<MigrationType | "">("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<MigrationSuggestion | null>(null);
  const [activeTab, setActiveTab] = useState<"ai-suggestions" | "manual">(
    "ai-suggestions",
  );

  const { data: stack, isLoading: isLoadingStack } =
    api.migration.detectStack.useQuery({ projectId }, { enabled: !!projectId });

  const { data: suggestions, isLoading: isLoadingSuggestions } =
    api.migration.getSuggestions.useQuery(
      { projectId },
      { enabled: !!projectId },
    );

  // Auto-select first suggestion when loaded
  useEffect(() => {
    if (suggestions && suggestions.length > 0 && !selectedSuggestion) {
      const firstSuggestion = suggestions[0];
      if (firstSuggestion) {
        setSelectedSuggestion(firstSuggestion);
        setSelectedType(mapSuggestionType(firstSuggestion));
        setSelectedTarget(firstSuggestion.to);
      }
    }
  }, [suggestions]);

  const handleSuggestionSelect = (suggestion: MigrationSuggestion) => {
    setSelectedSuggestion(suggestion);
    setSelectedType(mapSuggestionType(suggestion));
    setSelectedTarget(suggestion.to);
  };

  const handleAnalyze = () => {
    if (!selectedType || !selectedTarget) {
      toast.error("Please select a migration type and target");
      return;
    }
    onAnalyze(selectedType, selectedTarget);
  };

  const mapSuggestionType = (
    suggestion: MigrationSuggestion,
  ): MigrationType => {
    const typeMap: Record<string, MigrationType> = {
      framework: "framework",
      language: "language",
      architecture: "architecture",
      tool: "refactor",
    };
    return typeMap[suggestion.type] || "refactor";
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/30";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30";
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/30";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-900/30";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="h-4 w-4 text-blue-500" />
          Configure Migration
          {isLoadingStack && (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ✅ Detected Stack */}
        {stack && (
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Detected Stack</span>
              <Badge variant="secondary" className="text-[10px]">
                Confidence: {stack.confidence}%
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                {stack.framework} {stack.frameworkVersion}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stack.language}
              </Badge>
              {stack.bundler && stack.bundler !== "Unknown" && (
                <Badge variant="outline" className="text-xs">
                  {stack.bundler}
                </Badge>
              )}
              {stack.ui && stack.ui !== "Unknown" && (
                <Badge variant="outline" className="text-xs">
                  {stack.ui}
                </Badge>
              )}
              {stack.database && stack.database !== "Unknown" && (
                <Badge variant="outline" className="text-xs">
                  {stack.database}
                </Badge>
              )}
              {stack.auth && stack.auth !== "Unknown" && (
                <Badge variant="outline" className="text-xs">
                  {stack.auth}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Tabs: AI Suggestions vs Manual */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="ai-suggestions"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-3 w-3" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              Manual Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-suggestions" className="space-y-4">
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
                <span className="text-muted-foreground ml-2 text-sm">
                  Analyzing stack for migration suggestions...
                </span>
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              <>
                <div className="max-h-62.5 space-y-2 overflow-y-auto pr-2">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "cursor-pointer rounded-lg border p-3 transition-all",
                        selectedSuggestion?.name === suggestion.name
                          ? "border-blue-500 bg-blue-50 shadow-sm dark:bg-blue-950/30"
                          : "hover:border-zinc-300 dark:hover:border-zinc-700",
                      )}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium">
                              {suggestion.name}
                            </span>
                            <Badge
                              className={cn(
                                "text-[10px]",
                                getComplexityColor(suggestion.complexity),
                              )}
                            >
                              {suggestion.complexity}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {suggestion.popularity}% popular
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                            {suggestion.description}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-red-500 line-through">
                              {suggestion.from}
                            </span>
                            <ArrowRight className="text-muted-foreground h-3 w-3" />
                            <span className="text-xs font-medium text-green-500">
                              {suggestion.to}
                            </span>
                          </div>
                        </div>
                        {selectedSuggestion?.name === suggestion.name && (
                          <CheckCircle2 className="ml-2 h-4 w-4 shrink-0 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ✅ Selected Suggestion Details */}
                {selectedSuggestion && (
                  <div className="bg-muted/20 space-y-3 rounded-lg border p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>
                        Estimated Time: {selectedSuggestion.estimatedTime}
                      </span>
                    </div>

                    {selectedSuggestion.benefits &&
                      selectedSuggestion.benefits.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Benefits:
                          </span>
                          <ul className="text-muted-foreground mt-1 list-inside list-disc text-xs">
                            {selectedSuggestion.benefits
                              .slice(0, 3)
                              .map((benefit, idx) => (
                                <li key={idx}>{benefit}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                    {selectedSuggestion.risks &&
                      selectedSuggestion.risks.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            Risks:
                          </span>
                          <ul className="text-muted-foreground mt-1 list-inside list-disc text-xs">
                            {selectedSuggestion.risks
                              .slice(0, 2)
                              .map((risk, idx) => (
                                <li key={idx}>{risk}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Apply {selectedSuggestion.name}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No AI suggestions available</p>
                <p className="text-sm">Try manual configuration</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Migration Type
                </label>
                <Select
                  onValueChange={(value) =>
                    setSelectedType(value as MigrationType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {migrationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Migration Target
                </label>
                <Input
                  placeholder="e.g., Next.js 14, TypeScript..."
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedTarget || !selectedType}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Generate Migration Plan
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
