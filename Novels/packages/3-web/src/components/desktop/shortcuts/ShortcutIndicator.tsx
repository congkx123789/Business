// Visual indicator showing available shortcuts in current context
"use client";

import React from "react";
import { shortcutRegistry } from "@/lib/desktop/shortcuts/shortcut-registry";
import { ShortcutContext } from "@/lib/desktop/shortcuts/shortcut-context";
import { formatKeyCombo } from "@/lib/desktop/shortcuts/shortcut-config";
import { cn } from "@/lib/utils";

interface ShortcutIndicatorProps {
  context?: ShortcutContext;
  className?: string;
}

export const ShortcutIndicator: React.FC<ShortcutIndicatorProps> = ({
  context,
  className,
}) => {
  const shortcuts = context
    ? shortcutRegistry.getShortcutsByContext(context)
    : shortcutRegistry.getAllShortcuts();

  // Show only a few key shortcuts
  const keyShortcuts = shortcuts
    .filter((s) => s.enabled && !s.requiresPaidContent)
    .slice(0, 5);

  if (keyShortcuts.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {keyShortcuts.map((shortcut) => {
        const primaryKey = shortcut.keys[0] || "";

        return (
          <div
            key={shortcut.id}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <span>{shortcut.description}:</span>
            <kbd className="px-1.5 py-0.5 font-semibold bg-muted rounded border">
              {formatKeyCombo(primaryKey)}
            </kbd>
          </div>
        );
      })}
    </div>
  );
};

