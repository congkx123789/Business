// Reader UI state (tap to toggle controls, settings panel)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ReaderUIState {
  showControls: boolean;
  isSettingsOpen: boolean;
  lastInteraction: number | null;
  toggleControls: () => void;
  hideControls: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  setInteraction: () => void;
}

export const useReaderUIStore = create<ReaderUIState>()(
  persist(
    (set) => ({
      showControls: true,
      isSettingsOpen: false,
      lastInteraction: null,
      toggleControls: () =>
        set((state) => ({
          showControls: !state.showControls,
          lastInteraction: Date.now(),
        })),
      hideControls: () => set({ showControls: false }),
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      setInteraction: () => set({ lastInteraction: Date.now() }),
    }),
    {
      name: "reader-ui-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        showControls: state.showControls,
      }),
    }
  )
);

