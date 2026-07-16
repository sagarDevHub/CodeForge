"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface DeploymentSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportName: string;
  onReportNameChange: (value: string) => void;
  isDefault: boolean;
  onIsDefaultChange: (value: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  savedReportsCount: number;
}

export function DeploymentSaveDialog({
  open,
  onOpenChange,
  reportName,
  onReportNameChange,
  isDefault,
  onIsDefaultChange,
  onSave,
  isSaving,
  savedReportsCount,
}: DeploymentSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Deployment Report</DialogTitle>
          <DialogDescription>
            Save the current analysis as a named report for future reference.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="e.g., Sprint 15 Analysis"
              value={reportName}
              onChange={(e) => onReportNameChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefaultReport"
              checked={isDefault}
              onChange={(e) => onIsDefaultChange(e.target.checked)}
              className="border-muted-foreground h-4 w-4 rounded"
            />
            <Label htmlFor="isDefaultReport" className="text-sm font-normal">
              Set as default report
            </Label>
          </div>
          {savedReportsCount > 0 && (
            <div className="bg-muted text-muted-foreground rounded-lg p-2 text-xs">
              You have {savedReportsCount} saved report
              {savedReportsCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || !reportName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
