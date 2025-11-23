// Global keyboard shortcut handler provider
"use client";

import React, { useEffect } from "react";
import { useKeyboardShortcuts, ShortcutBinding } from "@/lib/hooks/desktop/useKeyboardShortcuts";
import { useCommandPalette } from "@/lib/hooks/desktop/useKeyboardShortcuts";
import { useShortcutsHelp } from "@/lib/hooks/desktop/useKeyboardShortcuts";
import { ShortcutContext } from "@/lib/desktop/shortcuts/shortcut-context";
import { CommandPalette } from "./CommandPalette";
import { ShortcutHelpDialog } from "./ShortcutHelpDialog";
import { shortcutRegistry } from "@/lib/desktop/shortcuts/shortcut-registry";
import { useKeyboardShortcutsStore } from "@/store/desktop/keyboard-shortcuts-store";

interface ShortcutProviderProps {
  children: React.ReactNode;
  shortcuts?: ShortcutBinding[];
  context?: ShortcutContext;
  isPaidContent?: boolean;
}

export const ShortcutProvider: React.FC<ShortcutProviderProps> = ({
  children,
  shortcuts = [],
  context,
  isPaidContent = false,
}) => {
  // Register global shortcuts (command palette, help)
  useCommandPalette();
  useShortcutsHelp();

  // Register custom shortcuts
  useKeyboardShortcuts(shortcuts, context, isPaidContent);

  // Load custom mappings from store
  const { customMappings, loadMappings } = useKeyboardShortcutsStore();

  useEffect(() => {
    // Load custom mappings into registry
    if (Object.keys(customMappings).length > 0) {
      const mappingsMap = new Map(
        Object.entries(customMappings).map(([id, mapping]) => [
          id,
          mapping as any,
        ])
      );
      shortcutRegistry.loadCustomMappings(mappingsMap);
    }
  }, [customMappings]);

  const { isCommandPaletteOpen, setCommandPaletteOpen } = useKeyboardShortcutsStore();
  const { isHelpDialogOpen, setHelpDialogOpen } = useKeyboardShortcutsStore();

  return (
    <>
      {children}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <ShortcutHelpDialog
        isOpen={isHelpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      />
    </>
  );
};

