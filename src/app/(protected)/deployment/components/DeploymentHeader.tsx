"use client";

interface DeploymentHeaderProps {
  projectName: string;
  isAnalyzing: boolean;
  hasAnalysis: boolean;
  onAnalyze: () => void;
}

export function DeploymentHeader({ projectName }: DeploymentHeaderProps) {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <span className="text-blue-500">🛡️</span>
        Deployment Readiness
      </h1>
      <p className="text-muted-foreground text-sm">
        AI-powered analysis for <strong>{projectName}</strong>
      </p>
    </div>
  );
}
