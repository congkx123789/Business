// Reading preferences store (client state)
// Stores UI state for reading preferences panel, controls visibility, etc.
// Note: Actual reading preferences data is stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReadingPreferencesUIState {
  // UI state only (not the actual preferences data)
  isSettingsPanelOpen: boolean;
  showControls: boolean;
  controlsTimeout: number; // milliseconds before auto-hiding controls
  toggleSettingsPanel: () => void;
  setSettingsPanelOpen: (open: boolean) => void;
  toggleControls: () => void;
  setShowControls: (show: boolean) => void;
  setControlsTimeout: (timeout: number) => void;
}

export const useReadingPreferencesUIStore = create<ReadingPreferencesUIState>()(
  persist(
    (set) => ({
      isSettingsPanelOpen: false,
      showControls: true,
      controlsTimeout: 3000, // 3 seconds default
      toggleSettingsPanel: () => {
        set((state) => ({ isSettingsPanelOpen: !state.isSettingsPanelOpen }));
      },
      setSettingsPanelOpen: (open) => {
        set({ isSettingsPanelOpen: open });
      },
      toggleControls: () => {
        set((state) => ({ showControls: !state.showControls }));
      },
      setShowControls: (show) => {
        set({ showControls: show });
      },
      setControlsTimeout: (timeout) => {
        set({ controlsTimeout: timeout });
      },
    }),
    {
      name: "reading-preferences-ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

