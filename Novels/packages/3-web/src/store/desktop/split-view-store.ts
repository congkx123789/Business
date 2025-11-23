// Split-view state store (chapter comparison)
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
}

interface SplitViewState {
  leftChapter: Chapter | null;
  rightChapter: Chapter | null;
  syncScroll: boolean;
  splitPosition: number; // 0-100, percentage
  setLeftChapter: (chapter: Chapter | null) => void;
  setRightChapter: (chapter: Chapter | null) => void;
  toggleSyncScroll: () => void;
  setSplitPosition: (position: number) => void;
  swapChapters: () => void;
  clear: () => void;
}

export const useSplitViewStore = create<SplitViewState>()(
  persist(
    (set, get) => ({
      leftChapter: null,
      rightChapter: null,
      syncScroll: false,
      splitPosition: 50, // Default 50/50 split
      setLeftChapter: (chapter) => set({ leftChapter: chapter }),
      setRightChapter: (chapter) => set({ rightChapter: chapter }),
      toggleSyncScroll: () => set((state) => ({ syncScroll: !state.syncScroll })),
      setSplitPosition: (position) => set({ splitPosition: Math.max(10, Math.min(90, position)) }),
      swapChapters: () =>
        set((state) => ({
          leftChapter: state.rightChapter,
          rightChapter: state.leftChapter,
        })),
      clear: () =>
        set({
          leftChapter: null,
          rightChapter: null,
          syncScroll: false,
          splitPosition: 50,
        }),
    }),
    {
      name: "split-view-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

