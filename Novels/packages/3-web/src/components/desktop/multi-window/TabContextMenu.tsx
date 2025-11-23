"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface TabContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCloseTab: () => void;
  onCloseOthers: () => void;
  onCloseAll: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onDuplicate: () => void;
  isPinned: boolean;
}

export const TabContextMenu: React.FC<TabContextMenuProps> = ({
  x,
  y,
  onClose,
  onCloseTab,
  onCloseOthers,
  onCloseAll,
  onPin,
  onUnpin,
  onDuplicate,
  isPinned,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      label: "Close",
      onClick: onCloseTab,
      shortcut: "Ctrl+W",
    },
    {
      label: "Close Others",
      onClick: onCloseOthers,
    },
    {
      label: "Close All",
      onClick: onCloseAll,
    },
    {
      label: "divider",
    },
    {
      label: isPinned ? "Unpin" : "Pin",
      onClick: isPinned ? onUnpin : onPin,
    },
    {
      label: "Duplicate",
      onClick: onDuplicate,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] rounded-md border border-border bg-popover p-1 shadow-lg"
      style={{ left: `${x}px`, top: `${y}px` }}
      role="menu"
    >
      {menuItems.map((item, index) => {
        if (item.label === "divider") {
          return <div key={index} className="my-1 border-t border-border" />;
        }
        return (
          <button
            key={index}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className={cn(
              "w-full rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:bg-accent focus:text-accent-foreground focus:outline-none"
            )}
            role="menuitem"
          >
            <div className="flex items-center justify-between">
              <span>{item.label}</span>
              {item.shortcut && (
                <span className="ml-4 text-xs text-muted-foreground">{item.shortcut}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

