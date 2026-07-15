"use client";

import { usePathname } from "next/navigation";
import useProject from "./use-project";
import { useEffect } from "react";

const pageNames: Record<string, string> = {
  dashboard: "Dashboard",
  qa: "Q&A",
  architecture: "Architecture",
  deployment: "Deployment",
  billing: "Billing",
  create: "Create Project",
};

export function usePageTitle() {
  const { project } = useProject();
  const pathname = usePathname();

  useEffect(() => {
    const segments = pathname?.split("/").filter(Boolean) || [];
    const pageKey = segments[segments.length - 1] || "dashboard";
    const pageName = pageNames[pageKey] || "CodeForge";

    const projectName = project?.name || "";

    if (projectName) {
      document.title = `${projectName} - ${pageName} | CodeForge`;
    } else {
      document.title = `${pageName} | CodeForge`;
    }

    return () => {
      document.title = "CodeForge";
    };
  }, [project, pathname]);
}
