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

interface ArchitectureSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blueprintName: string;
  onBlueprintNameChange: (value: string) => void;
  isDefault: boolean;
  onIsDefaultChange: (value: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
  savedBlueprintsCount: number;
}

export function ArchitectureSaveDialog({
  open,
  onOpenChange,
  blueprintName,
  onBlueprintNameChange,
  isDefault,
  onIsDefaultChange,
  onSave,
  isSaving,
  savedBlueprintsCount,
}: ArchitectureSaveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Architecture Blueprint</DialogTitle>
          <DialogDescription>
            Save the current architecture view as a named blueprint for future
            reference.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="blueprintName">Blueprint Name</Label>
            <Input
              id="blueprintName"
              placeholder="e.g., Microservices Architecture"
              value={blueprintName}
              onChange={(e) => onBlueprintNameChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefaultBlueprint"
              checked={isDefault}
              onChange={(e) => onIsDefaultChange(e.target.checked)}
              className="border-muted-foreground h-4 w-4 rounded"
            />
            <Label htmlFor="isDefaultBlueprint" className="text-sm font-normal">
              Set as default blueprint
            </Label>
          </div>
          {savedBlueprintsCount > 0 && (
            <div className="bg-muted text-muted-foreground rounded-lg p-2 text-xs">
              You have {savedBlueprintsCount} saved blueprint
              {savedBlueprintsCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving || !blueprintName.trim()}
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
                Save Blueprint
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
