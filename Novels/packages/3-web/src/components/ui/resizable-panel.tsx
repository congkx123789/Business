"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical";
  children: React.ReactNode;
}

interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode;
}

interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  withHandle?: boolean;
}

const ResizableContext = React.createContext<{
  direction: "horizontal" | "vertical";
  panels: Array<{ id: string; size: number }>;
  setPanelSize: (id: string, size: number) => void;
} | null>(null);

export const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
  ({ className, direction = "horizontal", children, ...props }, ref) => {
    const [panels, setPanels] = React.useState<Array<{ id: string; size: number }>>([]);

    const setPanelSize = React.useCallback((id: string, size: number) => {
      setPanels((prev) => {
        const index = prev.findIndex((p) => p.id === id);
        if (index === -1) {
          return [...prev, { id, size }];
        }
        const updated = [...prev];
        updated[index] = { id, size };
        return updated;
      });
    }, []);

    return (
      <ResizableContext.Provider value={{ direction, panels, setPanelSize }}>
        <div
          ref={ref}
          className={cn(
            "flex h-full w-full",
            direction === "horizontal" ? "flex-row" : "flex-col",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ResizableContext.Provider>
    );
  }
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

export const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  ({ className, defaultSize = 50, minSize = 10, maxSize = 90, children, ...props }, ref) => {
    const context = React.useContext(ResizableContext);
    const panelId = React.useId();
    const [size, setSize] = React.useState(defaultSize);
    const [isResizing, setIsResizing] = React.useState(false);

    React.useEffect(() => {
      if (context) {
        const panel = context.panels.find((p) => p.id === panelId);
        if (panel) {
          setSize(panel.size);
        }
      }
    }, [context, panelId]);

    const handleMouseDown = React.useCallback(
      (e: React.MouseEvent) => {
        if (!context) return;

        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startSize = size;

        const handleMouseMove = (e: MouseEvent) => {
          const delta = context.direction === "horizontal" ? e.clientX - startX : e.clientY - startY;
          const container = (e.target as HTMLElement).closest("[data-resizable-container]");
          if (!container) return;

          const containerSize =
            context.direction === "horizontal"
              ? container.getBoundingClientRect().width
              : container.getBoundingClientRect().height;

          const deltaPercent = (delta / containerSize) * 100;
          let newSize = startSize + deltaPercent;

          // Clamp to min/max
          newSize = Math.max(minSize, Math.min(maxSize, newSize));

          setSize(newSize);
          context.setPanelSize(panelId, newSize);
        };

        const handleMouseUp = () => {
          setIsResizing(false);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      },
      [context, size, minSize, maxSize, panelId]
    );

    return (
      <div
        ref={ref}
        data-resizable-container
        className={cn("relative", className)}
        style={{
          [context?.direction === "horizontal" ? "width" : "height"]: `${size}%`,
          flexShrink: 0,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResizablePanel.displayName = "ResizablePanel";

export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  ({ className, withHandle, ...props }, ref) => {
    const context = React.useContext(ResizableContext);
    const [isResizing, setIsResizing] = React.useState(false);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-px items-center justify-center bg-border transition-colors hover:bg-border/80",
          context?.direction === "vertical" && "h-px w-full",
          isResizing && "bg-primary",
          className
        )}
        onMouseDown={(e) => {
          setIsResizing(true);
          // The actual resize logic is handled by ResizablePanel
        }}
        {...props}
      >
        {withHandle && (
          <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
            <div className="h-4 w-1 rounded-full bg-border" />
          </div>
        )}
      </div>
    );
  }
);
ResizableHandle.displayName = "ResizableHandle";

