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
import type { SavedReport } from "./types";

interface DeploymentReportListProps {
  reports: SavedReport[];
  onLoadReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  onSaveClick: () => void;
  isLoading?: boolean;
}

export function DeploymentReportList({
  reports,
  onLoadReport,
  onDeleteReport,
  onSaveClick,
  isLoading = false,
}: DeploymentReportListProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Reports ({reports.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {reports.length === 0 ? (
          <DropdownMenuItem disabled>No saved reports</DropdownMenuItem>
        ) : (
          reports.map((report) => (
            <DropdownMenuItem
              key={report.id}
              className="group flex justify-between"
            >
              <span
                className="flex-1 cursor-pointer truncate"
                onClick={() => onLoadReport(report.id)}
              >
                {report.name}
                {report.isDefault && (
                  <Star className="ml-1 inline h-3 w-3 text-yellow-500" />
                )}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteReport(report.id);
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
          Save Current Analysis
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
