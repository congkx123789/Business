// User customization UI for keyboard shortcuts
"use client";

import React, { useState } from "react";
import { shortcutRegistry } from "@/lib/desktop/shortcuts/shortcut-registry";
import { useKeyboardShortcutsStore } from "@/store/desktop/keyboard-shortcuts-store";
import { formatKeyCombo, parseKeyCombo } from "@/lib/desktop/shortcuts/shortcut-config";
import { validateShortcuts, wouldConflict } from "@/lib/desktop/shortcuts/shortcut-validator";
import { cn } from "@/lib/utils";

interface ShortcutSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutSettings: React.FC<ShortcutSettingsProps> = ({
  isOpen,
  onClose,
}) => {
  const { customMappings, setCustomMapping, removeCustomMapping, resetAllMappings } =
    useKeyboardShortcutsStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newKeyCombo, setNewKeyCombo] = useState("");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const shortcuts = shortcutRegistry.getAllShortcuts();
  const categories = Array.from(
    new Set(shortcuts.map((s) => s.category))
  ).sort();

  const handleStartEdit = (id: string) => {
    setEditingId(id);
    setNewKeyCombo("");
    setConflictWarning(null);
  };

  const handleSaveEdit = (id: string) => {
    if (!newKeyCombo.trim()) {
      setEditingId(null);
      return;
    }

    const shortcut = shortcutRegistry.getShortcut(id);
    if (!shortcut) return;

    // Validate key combo
    try {
      parseKeyCombo(newKeyCombo);
    } catch (error) {
      setConflictWarning("Invalid key combination");
      return;
    }

    // Check for conflicts
    const updatedShortcut = {
      ...shortcut,
      keys: [newKeyCombo],
    };

    const conflicts = wouldConflict(updatedShortcut, shortcuts);
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const otherShortcut =
        conflict.shortcut1.id === id ? conflict.shortcut2 : conflict.shortcut1;
      setConflictWarning(
        `Conflict with "${otherShortcut.description}" (${formatKeyCombo(otherShortcut.keys[0] || "")})`
      );
      return;
    }

    // Save customization
    setCustomMapping(id, { keys: [newKeyCombo] });
    shortcutRegistry.updateShortcut(id, { keys: [newKeyCombo] });
    setEditingId(null);
    setNewKeyCombo("");
    setConflictWarning(null);
  };

  const handleReset = (id: string) => {
    shortcutRegistry.resetShortcut(id);
    removeCustomMapping(id);
  };

  const handleResetAll = () => {
    if (confirm("Reset all shortcuts to defaults?")) {
      shortcutRegistry.resetAllShortcuts();
      resetAllMappings();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[80vh] rounded-lg border bg-background shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold">Keyboard Shortcuts Settings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(80vh-120px)]">
          <div className="space-y-6">
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
                      const isEditing = editingId === shortcut.id;
                      const customMapping = customMappings[shortcut.id];
                      const displayKeys = customMapping?.keys || shortcut.keys;
                      const primaryKey = displayKeys[0] || "";

                      return (
                        <div
                          key={shortcut.id}
                          className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                        >
                          <span className="text-sm flex-1">{shortcut.description}</span>
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={newKeyCombo}
                                  onChange={(e) => setNewKeyCombo(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveEdit(shortcut.id);
                                    } else if (e.key === "Escape") {
                                      setEditingId(null);
                                      setNewKeyCombo("");
                                      setConflictWarning(null);
                                    }
                                  }}
                                  placeholder="Press keys..."
                                  className="px-2 py-1 text-xs border rounded w-32"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveEdit(shortcut.id)}
                                  className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setNewKeyCombo("");
                                    setConflictWarning(null);
                                  }}
                                  className="text-xs px-2 py-1 bg-muted rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <kbd className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded border">
                                  {formatKeyCombo(primaryKey)}
                                </kbd>
                                {customMapping && (
                                  <button
                                    onClick={() => handleReset(shortcut.id)}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                  >
                                    Reset
                                  </button>
                                )}
                                <button
                                  onClick={() => handleStartEdit(shortcut.id)}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {editingId && conflictWarning && (
                    <div className="mt-2 text-xs text-destructive">
                      {conflictWarning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

