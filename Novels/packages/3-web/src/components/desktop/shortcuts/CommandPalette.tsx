// Command palette component (Ctrl+K)
"use client";

import React, { useState, useEffect, useRef } from "react";
import { shortcutRegistry } from "@/lib/desktop/shortcuts/shortcut-registry";
import { formatKeyCombo } from "@/lib/desktop/shortcuts/shortcut-config";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const shortcuts = shortcutRegistry.getAllShortcuts();
  const filteredShortcuts = shortcuts.filter((s) => {
    const searchLower = search.toLowerCase();
    return (
      s.description.toLowerCase().includes(searchLower) ||
      s.action.toLowerCase().includes(searchLower) ||
      s.category.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredShortcuts.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredShortcuts[selectedIndex]) {
        e.preventDefault();
        const shortcut = filteredShortcuts[selectedIndex];
        if (shortcut.handler) {
          shortcut.handler(e as any, shortcut);
        }
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredShortcuts, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof filteredShortcuts>);

  let currentIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-lg border bg-background shadow-lg">
        <div className="flex items-center border-b px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent outline-none"
            autoFocus
          />
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredShortcuts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No commands found
            </div>
          ) : (
            Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="mb-4">
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
                  {category}
                </div>
                {categoryShortcuts.map((shortcut) => {
                  const index = currentIndex++;
                  const isSelected = index === selectedIndex;
                  const primaryKey = shortcut.keys[0] || "";

                  return (
                    <div
                      key={shortcut.id}
                      className={cn(
                        "flex items-center justify-between rounded-md px-4 py-2 cursor-pointer",
                        isSelected && "bg-accent"
                      )}
                      onClick={() => {
                        if (shortcut.handler) {
                          shortcut.handler({} as any, shortcut);
                        }
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div>
                        <div className="font-medium">{shortcut.description}</div>
                        <div className="text-xs text-muted-foreground">{shortcut.action}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border">
                          {formatKeyCombo(primaryKey)}
                        </kbd>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

