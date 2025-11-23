// Keyboard shortcuts state management using Zustand
// Stores user customizations and sync state

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ShortcutDefinition } from "@/lib/desktop/shortcuts/shortcut-config";

interface KeyboardShortcutsState {
  customMappings: Record<string, Partial<ShortcutDefinition>>;
  isHelpDialogOpen: boolean;
  isCommandPaletteOpen: boolean;
  isSettingsOpen: boolean;
  setCustomMapping: (id: string, mapping: Partial<ShortcutDefinition>) => void;
  removeCustomMapping: (id: string) => void;
  resetAllMappings: () => void;
  setHelpDialogOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  loadMappings: (mappings: Record<string, Partial<ShortcutDefinition>>) => void;
}

export const useKeyboardShortcutsStore = create<KeyboardShortcutsState>()(
  persist(
    (set) => ({
      customMappings: {},
      isHelpDialogOpen: false,
      isCommandPaletteOpen: false,
      isSettingsOpen: false,

      setCustomMapping: (id, mapping) =>
        set((state) => ({
          customMappings: {
            ...state.customMappings,
            [id]: mapping,
          },
        })),

      removeCustomMapping: (id) =>
        set((state) => {
          const { [id]: removed, ...rest } = state.customMappings;
          return { customMappings: rest };
        }),

      resetAllMappings: () =>
        set({
          customMappings: {},
        }),

      setHelpDialogOpen: (open) =>
        set({
          isHelpDialogOpen: open,
        }),

      setCommandPaletteOpen: (open) =>
        set({
          isCommandPaletteOpen: open,
        }),

      setSettingsOpen: (open) =>
        set({
          isSettingsOpen: open,
        }),

      loadMappings: (mappings) =>
        set({
          customMappings: mappings,
        }),
    }),
    {
      name: "keyboard-shortcuts-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        customMappings: state.customMappings,
      }),
    }
  )
);

