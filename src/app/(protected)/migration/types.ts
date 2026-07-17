import { MigrationActions } from "./components";

export interface MigrationStep {
  order: number;
  title: string;
  description: string;
  files: string[];
  commands: string[];
}

export interface MigrationRisk {
  level: "low" | "medium" | "high" | "critical";
  description: string;
  mitigation: string;
}

export interface MigrationDependency {
  name: string;
  from: string;
  to: string;
  reason: string;
}

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  steps: MigrationStep[];
  risks: MigrationRisk[];
  files: string[];
  dependencies: MigrationDependency[];
  estimatedTime?: string;
  progress?: number;
  currentStep?: number;
  totalSteps?: number;
  githubPrNumber?: number;
  githubPrUrl?: string;
  githubBranch?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MigrationType =
  | "framework"
  | "language"
  | "architecture"
  | "refactor";

export type MigrationStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "completed"
  | "failed"
  | "rolled_back";

export interface DetectedStack {
  framework: string;
  frameworkVersion: string;
  language: string;
  bundler: string;
  database: string;
  auth: string;
  ui: string;
  stateManagement: string;
  testing: string[];
  otherDetected: string[];
  confidence: number;
}

export interface MigrationSuggestion {
  name: string;
  description: string;
  from: string;
  to: string;
  type: "framework" | "language" | "architecture" | "tool";
  complexity: "low" | "medium" | "high";
  benefits: string[];
  risks: string[];
  estimatedTime: string;
  popularity: number;
}
