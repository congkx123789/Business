"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const BLOCKED_KEYS = new Set(["c", "s", "p", "x", "u", "printscreen"]);

export interface CopyProtectionProps {
  enabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onBlockedAction?: (type: "copy" | "context-menu" | "shortcut") => void;
  onViolation?: (type: "copy" | "context-menu" | "shortcut") => void; // Alias for onBlockedAction for compatibility
}

/**
 * CopyProtection component - Prevents copying, context menu, and keyboard shortcuts
 * Used for DRM content protection (Rule #27)
 */
export const CopyProtection: React.FC<CopyProtectionProps> = ({
  enabled = true,
  className,
  children,
  onBlockedAction,
  onViolation,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const handler = onBlockedAction || onViolation;

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    const containsTarget = (event: Event) => {
      const target = event.target as Node | null;
      return target && rootRef.current?.contains(target);
    };

    const handleCopy = (event: ClipboardEvent) => {
      if (!containsTarget(event)) {
        return;
      }
      event.preventDefault();
      handler?.("copy");
    };

    const handleContextMenu = (event: MouseEvent) => {
      if (!containsTarget(event)) {
        return;
      }
      event.preventDefault();
      handler?.("context-menu");
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!containsTarget(event)) {
        return;
      }
      if (event.metaKey || event.ctrlKey) {
        const key = event.key.toLowerCase();
        if (BLOCKED_KEYS.has(key)) {
          event.preventDefault();
          handler?.("shortcut");
        }
      }
    };

    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCopy, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCopy, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, handler]);

  return (
    <div
      ref={rootRef}
      className={cn(enabled ? "select-none" : "select-auto", className)}
      data-protected={enabled ? "true" : "false"}
      style={enabled ? { userSelect: "none", WebkitUserSelect: "none" } : undefined}
    >
      {children}
    </div>
  );
};
