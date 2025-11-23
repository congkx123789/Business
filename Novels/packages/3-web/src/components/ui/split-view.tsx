"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface SplitViewProps {
  orientation?: "vertical" | "horizontal";
  position: number; // percentage for first pane
  min?: number;
  max?: number;
  onPositionChange?: (position: number) => void;
  className?: string;
  left: React.ReactNode;
  right: React.ReactNode;
}

const clamp = (value: number, min = 10, max = 90) => Math.min(Math.max(value, min), max);

export const SplitView: React.FC<SplitViewProps> = ({
  orientation = "vertical",
  position,
  min = 15,
  max = 85,
  onPositionChange,
  className,
  left,
  right,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ start: number; size: number; initial: number } | null>(null);

  const startDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragState.current = {
      start: orientation === "vertical" ? event.clientX : event.clientY,
      size: orientation === "vertical" ? rect.width : rect.height,
      initial: position,
    };

    const handleMove = (moveEvent: MouseEvent) => {
      if (!dragState.current) return;
      const offset =
        (orientation === "vertical" ? moveEvent.clientX : moveEvent.clientY) -
        dragState.current.start;
      const delta = (offset / dragState.current.size) * 100;
      const next = clamp(dragState.current.initial + delta, min, max);
      onPositionChange?.(next);
    };

    const endDrag = () => {
      dragState.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", endDrag);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", endDrag);
  };

  const containerClasses =
    orientation === "vertical" ? "flex flex-row items-stretch" : "flex flex-col";
  const firstStyle =
    orientation === "vertical"
      ? { width: `${clamp(position, min, max)}%` }
      : { height: `${clamp(position, min, max)}%` };
  const secondStyle =
    orientation === "vertical"
      ? { width: `${clamp(100 - position, 100 - max, 100 - min)}%` }
      : { height: `${clamp(100 - position, 100 - max, 100 - min)}%` };

  return (
    <div ref={containerRef} className={cn("relative flex w-full", containerClasses, className)}>
      <div className="overflow-hidden" style={firstStyle}>
        {left}
      </div>
      <div
        className={cn(
          "group flex items-center justify-center bg-transparent",
          orientation === "vertical" ? "w-1 cursor-col-resize" : "h-1 cursor-row-resize"
        )}
        onMouseDown={startDrag}
        role="separator"
        aria-orientation={orientation === "vertical" ? "horizontal" : "vertical"}
        aria-label="Resize split view"
      >
        <div
          className={cn(
            "rounded-full bg-border transition-colors",
            orientation === "vertical" ? "h-12 w-1 group-hover:bg-primary" : "w-12 h-1 group-hover:bg-primary"
          )}
        />
      </div>
      <div className="overflow-hidden" style={secondStyle}>
        {right}
      </div>
    </div>
  );
};


