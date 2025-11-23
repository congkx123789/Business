// Shortcuts help dialog component (press ? or Ctrl+/)
"use client";

import React, { useEffect } from "react";
import { shortcutRegistry } from "@/lib/desktop/shortcuts/shortcut-registry";
import { formatKeyCombo } from "@/lib/desktop/shortcuts/shortcut-config";
import { cn } from "@/lib/utils";

interface ShortcutHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutHelpDialog: React.FC<ShortcutHelpDialogProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = shortcutRegistry.getAllShortcuts();
  const categories = Array.from(
    new Set(shortcuts.map((s) => s.category))
  ).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[80vh] rounded-lg border bg-background shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => {
              const categoryShortcuts = shortcuts.filter(
                (s) => s.category === category
              );

              return (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => {
                      const primaryKey = shortcut.keys[0] || "";

                      return (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-sm">{shortcut.description}</span>
                          <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border">
                            {formatKeyCombo(primaryKey)}
                          </kbd>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t px-6 py-4 bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-background rounded border">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

