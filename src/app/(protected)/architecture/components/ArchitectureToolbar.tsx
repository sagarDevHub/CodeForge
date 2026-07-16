"use client";

import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Loader2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import type { ViewMode } from "../types";

interface ArchitectureToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onRefresh: () => void;
  onClearCache: () => void;
  isLoading: boolean;
  isInvalidating: boolean;
  hasData: boolean;
}

export function ArchitectureToolbar({
  viewMode,
  onViewModeChange,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  isFullscreen,
  onFullscreenToggle,
  onRefresh,
  onClearCache,
  isLoading,
  isInvalidating,
  hasData,
}: ArchitectureToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {/* View Mode Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          onViewModeChange(viewMode === "graph" ? "list" : "graph")
        }
        className="h-6 px-1.5 text-[10px] sm:h-7 sm:px-2 sm:text-xs"
      >
        {viewMode === "graph" ? "List" : "Graph"}
      </Button>

      {/* Zoom Controls */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomOut}
          className="h-6 w-6 p-0 sm:h-7 sm:w-7"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        <span className="min-w-10 text-center text-[10px] text-zinc-500 sm:text-xs">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onZoomIn}
          className="h-6 w-6 p-0 sm:h-7 sm:w-7"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
      </div>

      {/* Fullscreen Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreenToggle}
        className="h-6 w-6 p-0 sm:h-7 sm:w-7"
      >
        {isFullscreen ? (
          <Minimize2 className="h-3 w-3" />
        ) : (
          <Maximize2 className="h-3 w-3" />
        )}
      </Button>

      {/* Refresh Button */}
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className="h-7 px-2 text-[10px] sm:h-9 sm:px-3 sm:text-sm"
      >
        <RefreshCw
          className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? "animate-spin" : ""}`}
        />
        <span className="ml-1 hidden sm:inline">Refresh</span>
      </Button>

      {/* Clear Cache Button */}
      <Button
        onClick={onClearCache}
        disabled={isInvalidating}
        variant="destructive"
        size="sm"
        className="h-7 px-2 text-[10px] sm:h-9 sm:px-3 sm:text-sm"
      >
        {isInvalidating ? (
          <Loader2 className="h-3 w-3 animate-spin sm:h-4 sm:w-4" />
        ) : (
          "Clear Cache"
        )}
      </Button>
    </div>
  );
}
