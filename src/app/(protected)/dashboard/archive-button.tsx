"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { ArchiveIcon, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/confirmation-dialog";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId, project } = useProject();
  const refetch = useRefetch();
  const [showDialog, setShowDialog] = useState(false);

  const handleArchive = () => {
    archiveProject.mutate(
      { projectId },
      {
        onSuccess: () => {
          toast.success(`Project "${project?.name}" archived successfully`);
          refetch();
          setShowDialog(false);
        },
        onError: () => {
          toast.error("Failed to archive project");
        },
      },
    );
  };

  return (
    <>
      <Button
        disabled={archiveProject.isPending}
        size="sm"
        variant="destructive"
        className="rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/30"
        onClick={() => setShowDialog(true)}
      >
        {archiveProject.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ArchiveIcon className="mr-2 h-4 w-4" />
        )}
        Archive
      </Button>

      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onConfirm={handleArchive}
        title={`Archive "${project?.name}"`}
        description={`Are you sure you want to archive the project "${project?.name}"? You can restore it later from the settings.`}
        confirmText="Archive"
        cancelText="Cancel"
        variant="destructive"
        isLoading={archiveProject.isPending}
      />
    </>
  );
};

export default ArchiveButton;
