"use client";

import React from "react";
import { Tab } from "@/store/desktop/multi-window-store";
import { cn } from "@/lib/utils";
import { X, Pin } from "lucide-react";

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: (e: React.MouseEvent) => void;
  onPin: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onClick,
  onClose,
  onPin,
  onContextMenu,
}) => {
  return (
    <div
      className={cn(
        "group relative flex min-w-0 max-w-[200px] items-center gap-2 rounded-t-lg border-b-2 px-3 py-2 text-sm transition-colors",
        isActive
          ? "border-primary bg-background text-foreground"
          : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      role="tab"
      aria-selected={isActive}
    >
      {tab.pinned && (
        <Pin className="h-3 w-3 shrink-0 text-primary" size={12} />
      )}
      <span className="min-w-0 truncate" title={tab.title}>
        {tab.title}
      </span>
      <div className="ml-auto flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin(e);
          }}
          className={cn(
            "opacity-0 transition-opacity group-hover:opacity-100",
            tab.pinned && "opacity-100"
          )}
          aria-label={tab.pinned ? "Unpin tab" : "Pin tab"}
        >
          <Pin
            className={cn(
              "h-3 w-3",
              tab.pinned ? "text-primary fill-primary" : "text-muted-foreground"
            )}
            size={12}
          />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
          className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          aria-label="Close tab"
        >
          <X className="h-3 w-3" size={12} />
        </button>
      </div>
    </div>
  );
};

