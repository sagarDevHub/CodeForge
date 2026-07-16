"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GitBranch, Loader2, Rocket, Code2, Zap } from "lucide-react";
import type { MigrationType } from "../types";

interface MigrationConfigProps {
  onAnalyze: (type: MigrationType, target: string) => void;
  isAnalyzing: boolean;
}

const migrationTypes = [
  { value: "framework", label: "Framework Upgrade", icon: Rocket },
  { value: "language", label: "Language Migration", icon: Code2 },
  { value: "architecture", label: "Architecture Change", icon: GitBranch },
  { value: "refactor", label: "Code Refactoring", icon: Zap },
];

const migrationTargets: Record<
  string,
  Array<{ value: string; label: string }>
> = {
  framework: [
    { value: "nextjs14", label: "Next.js 14 (App Router)" },
    { value: "react18", label: "React 18" },
    { value: "tailwind4", label: "Tailwind CSS v4" },
    { value: "prisma6", label: "Prisma v6" },
  ],
  language: [
    { value: "typescript", label: "JavaScript → TypeScript" },
    { value: "esm", label: "CommonJS → ESM" },
  ],
  architecture: [
    { value: "microservices", label: "Monolith → Microservices" },
    { value: "graphql", label: "REST → GraphQL" },
    { value: "serverless", label: "Traditional → Serverless" },
  ],
  refactor: [
    { value: "hooks", label: "Class Components → Hooks" },
    { value: "async", label: "Callbacks → Async/Await" },
    { value: "functional", label: "OOP → Functional" },
  ],
};

export function MigrationConfig({
  onAnalyze,
  isAnalyzing,
}: MigrationConfigProps) {
  const [selectedType, setSelectedType] = useState<MigrationType | "">("");
  const [selectedTarget, setSelectedTarget] = useState("");

  const handleAnalyze = () => {
    if (!selectedType || !selectedTarget) return;
    onAnalyze(selectedType, selectedTarget);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Configure Migration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Migration Type
            </label>
            <Select
              onValueChange={(value) => setSelectedType(value as MigrationType)}
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
            <Select onValueChange={setSelectedTarget} disabled={!selectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Select target..." />
              </SelectTrigger>
              <SelectContent>
                {selectedType &&
                  migrationTargets[selectedType]?.map((target) => (
                    <SelectItem key={target.value} value={target.value}>
                      {target.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !selectedTarget || !selectedType}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Codebase...
            </>
          ) : (
            <>
              <GitBranch className="mr-2 h-4 w-4" />
              Generate Migration Plan
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
