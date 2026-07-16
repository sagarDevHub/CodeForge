"use client";

import { Button } from "@/components/ui/button";
import type { FilterType } from "../types";

interface ArchitectureFiltersProps {
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function ArchitectureFilters({
  filterType,
  onFilterChange,
}: ArchitectureFiltersProps) {
  const filters: Array<{ value: FilterType; label: string }> = [
    { value: "all", label: "All" },
    { value: "module", label: "Module" },
    { value: "file", label: "File" },
    { value: "resource", label: "Resource" },
  ];

  return (
    <div className="flex rounded-lg border border-zinc-200 p-0.5 sm:p-1 dark:border-zinc-800">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={filterType === filter.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="h-6 px-1.5 text-[10px] capitalize sm:h-7 sm:px-2 sm:text-xs"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
