// Filtered view store (client state)
// Stores UI state for filtered views (saved filters, active filter, etc.)
// Note: Actual filtered view data is stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface FilteredViewUIState {
  activeFilteredViewId: string | null;
  savedFilterPresets: Array<{
    id: string;
    name: string;
    filters: Record<string, unknown>;
  }>;
  setActiveFilteredView: (viewId: string | null) => void;
  addFilterPreset: (preset: { id: string; name: string; filters: Record<string, unknown> }) => void;
  removeFilterPreset: (presetId: string) => void;
  updateFilterPreset: (presetId: string, updates: Partial<{ name: string; filters: Record<string, unknown> }>) => void;
}

export const useFilteredViewUIStore = create<FilteredViewUIState>()(
  persist(
    (set) => ({
      activeFilteredViewId: null,
      savedFilterPresets: [],
      setActiveFilteredView: (viewId) => {
        set({ activeFilteredViewId: viewId });
      },
      addFilterPreset: (preset) => {
        set((state) => ({
          savedFilterPresets: [...state.savedFilterPresets, preset],
        }));
      },
      removeFilterPreset: (presetId) => {
        set((state) => ({
          savedFilterPresets: state.savedFilterPresets.filter((p) => p.id !== presetId),
        }));
      },
      updateFilterPreset: (presetId, updates) => {
        set((state) => ({
          savedFilterPresets: state.savedFilterPresets.map((p) =>
            p.id === presetId ? { ...p, ...updates } : p
          ),
        }));
      },
    }),
    {
      name: "filtered-view-ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

