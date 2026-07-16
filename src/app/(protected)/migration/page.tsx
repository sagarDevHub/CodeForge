"use client";

import { usePageTitle } from "@/hooks/use-page-title";
import useProject from "@/hooks/use-project";
import { Terminal } from "lucide-react";
import { MigrationAssistant } from "./components";

export default function MigrationPage() {
  usePageTitle();
  const { project } = useProject();
  const projectId = project?.id;

  if (!projectId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <Terminal className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="text-xl font-bold">No Project Selected</h2>
          <p className="text-muted-foreground text-sm">
            Select a project to start the migration assistant
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <MigrationAssistant projectId={projectId} />
    </div>
  );
}
