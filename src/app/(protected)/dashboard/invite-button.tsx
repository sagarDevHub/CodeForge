"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import { Copy, Users } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const InviteButton = () => {
  const { projectId } = useProject();
  const [open, setOpen] = React.useState(false);

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/join/${projectId}`
      : "";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl sm:max-w-md dark:border-zinc-800 dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <Users className="h-5 w-5 text-[#0A66FF]" />
              Invite Team Members
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Share this link with your teammates to collaborate on this
              project.
            </p>

            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="border-zinc-200 bg-zinc-50 font-mono text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />

              {/* Copy Button Fix */}
              <Button
                type="button"
                className="cursor-pointer bg-[#0A66FF] text-white hover:bg-[#0A66FF]/90" // 👈 Added text-white & hover effect
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  toast.success("Invite link copied!");
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Alert Box Dark Mode Optimization */}
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-950/30 dark:bg-blue-950/20">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Anyone with this link can join this project.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Trigger Button Fix */}
      <Button
        size="sm"
        className="cursor-pointer rounded-md bg-[#0A66FF] font-medium text-white hover:bg-[#0A66FF]/90" // 👈 Added text-white explicitly
        onClick={() => setOpen(true)}
      >
        Invite Members
      </Button>
    </>
  );
};

export default InviteButton;
