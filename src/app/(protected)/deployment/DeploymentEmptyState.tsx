"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Terminal } from "lucide-react";

export function DeploymentEmptyState() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="p-6 text-center">
        <Terminal className="text-muted-foreground mx-auto h-12 w-12" />
        <h2 className="mt-4 text-xl font-bold">No Project Selected</h2>
        <p className="text-muted-foreground text-sm">
          Select a project from the sidebar to analyze.
        </p>
      </Card>
    </div>
  );
}
