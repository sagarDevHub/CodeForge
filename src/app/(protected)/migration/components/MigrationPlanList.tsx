// src/app/(protected)/migration/components/MigrationPlanList.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Save,
  Trash2,
  Edit2,
  Clock,
  GitBranch,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import type { MigrationPlan } from "../types";

interface MigrationPlanListProps {
  plans: MigrationPlan[];
  onLoadPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onEditPlan: (plan: MigrationPlan) => void;
  onCreateNew: () => void;
  isLoading?: boolean;
  currentPlanId?: string;
}

export function MigrationPlanList({
  plans,
  onLoadPlan,
  onDeletePlan,
  onEditPlan,
  onCreateNew,
  isLoading = false,
  currentPlanId,
}: MigrationPlanListProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
      case "ready":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case "in_progress":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "completed":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      case "rolled_back":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <FolderOpen className="mr-2 h-4 w-4" />
          Plans ({plans.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-100 w-80 overflow-y-auto"
      >
        {plans.length === 0 ? (
          <div className="text-muted-foreground p-4 text-center text-sm">
            <p>No saved plans</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onCreateNew();
              }}
              className="mt-2"
            >
              <Plus className="mr-1 h-3 w-3" />
              Create your first plan
            </Button>
          </div>
        ) : (
          <>
            {plans.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                className="hover:bg-accent flex cursor-pointer flex-col items-start p-3"
                onClick={() => {
                  setIsOpen(false);
                  onLoadPlan(plan.id);
                }}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="max-w-37.5 truncate text-sm font-medium">
                    {plan.name}
                    {plan.id === currentPlanId && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        Active
                      </Badge>
                    )}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        onEditPlan(plan);
                      }}
                    >
                      <Edit2 className="h-3 w-3 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        onDeletePlan(plan.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="mt-1 flex w-full items-center gap-2">
                  <Badge className={getStatusColor(plan.status)}>
                    {plan.status}
                  </Badge>
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {format(new Date(plan.createdAt), "MMM d, yyyy")}
                  </span>
                  {plan.githubPrNumber && (
                    <span className="flex items-center gap-1 text-xs text-blue-500">
                      <GitBranch className="h-3 w-3" />
                      PR #{plan.githubPrNumber}
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateNew}
              className="justify-center text-blue-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Plan
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
