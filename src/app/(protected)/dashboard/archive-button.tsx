"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { ArchiveIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      disabled={archiveProject.isPending}
      size="sm"
      variant="destructive"
      className="rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );
        if (confirm)
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived");
                refetch();
              },
              onError: () => {
                toast.error("failed to archive project");
              },
            },
          );
      }}
    >
      <ArchiveIcon className="mr-2 h-4 w-4" />
      Archive
    </Button>
  );
};

export default ArchiveButton;
