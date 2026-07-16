"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { FolderOpen, Save, Trash2, Star } from "lucide-react";
import type { Blueprint } from "../types";

interface ArchitectureBlueprintListProps {
  blueprints: Blueprint[];
  onLoadBlueprint: (id: string) => void;
  onDeleteBlueprint: (id: string) => void;
  onSaveClick: () => void;
  isLoading?: boolean;
}

export function ArchitectureBlueprintList({
  blueprints,
  onLoadBlueprint,
  onDeleteBlueprint,
  onSaveClick,
  isLoading = false,
}: ArchitectureBlueprintListProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Blueprints ({blueprints.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {blueprints.length === 0 ? (
          <DropdownMenuItem disabled>No saved blueprints</DropdownMenuItem>
        ) : (
          blueprints.map((blueprint) => (
            <DropdownMenuItem
              key={blueprint.id}
              className="group flex justify-between"
            >
              <span
                className="flex-1 cursor-pointer truncate"
                onClick={() => onLoadBlueprint(blueprint.id)}
              >
                {blueprint.name}
                {blueprint.isDefault && (
                  <Star className="ml-1 inline h-3 w-3 text-yellow-500" />
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlueprint(blueprint.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSaveClick}>
          <Save className="mr-2 h-4 w-4" />
          Save Current View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
