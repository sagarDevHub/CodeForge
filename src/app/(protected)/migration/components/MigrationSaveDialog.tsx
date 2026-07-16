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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface MigrationSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  onPlanNameChange: (value: string) => void;
  planDescription: string;
  onPlanDescriptionChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  isEditing?: boolean;
}

export function MigrationSaveDialog({
  open,
  onOpenChange,
  planName,
  onPlanNameChange,
  planDescription,
  onPlanDescriptionChange,
  onSave,
  isSaving,
  isEditing = false,
}: MigrationSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Migration Plan" : "Save Migration Plan"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the name and description of your migration plan."
              : "Save your migration plan for future reference."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="planName">Plan Name</Label>
            <Input
              id="planName"
              placeholder="e.g., Next.js 14 Migration"
              value={planName}
              onChange={(e) => onPlanNameChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="planDescription">Description (Optional)</Label>
            <Textarea
              id="planDescription"
              placeholder="Describe your migration plan..."
              value={planDescription}
              onChange={(e) => onPlanDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || !planName.trim()}
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
                {isEditing ? "Update Plan" : "Save Plan"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
