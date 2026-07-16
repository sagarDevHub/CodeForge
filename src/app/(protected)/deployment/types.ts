export interface AIAnalysis {
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  performanceScore: number;
  securityScore: number;
  maintainabilityScore: number;
  confidence: number;
  issues: string[];
  recommendations: string[];
  suggestions: Array<{
    title: string;
    description: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    effort: "LOW" | "MEDIUM" | "HIGH";
  }>;
  stack: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface SavedReport {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  metadata: any;
}
