import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PaywallState {
  activeStoryId: string | null;
  activeChapterId: string | null;
  isVisible: boolean;
  unlockedChapters: Record<string, string[]>; // storyId -> chapterIds
  showPaywall: (payload: { storyId: string; chapterId: string }) => void;
  hidePaywall: () => void;
  markChapterUnlocked: (storyId: string, chapterId: string) => void;
  isChapterUnlocked: (storyId: string, chapterId: string) => boolean;
}

export const usePaywallStore = create<PaywallState>()(
  persist(
    (set, get) => ({
      activeStoryId: null,
      activeChapterId: null,
      isVisible: false,
      unlockedChapters: {},
      showPaywall: ({ storyId, chapterId }) =>
        set({
          activeStoryId: storyId,
          activeChapterId: chapterId,
          isVisible: true,
        }),
      hidePaywall: () =>
        set({
          isVisible: false,
          activeStoryId: null,
          activeChapterId: null,
        }),
      markChapterUnlocked: (storyId, chapterId) =>
        set((state) => {
          const current = state.unlockedChapters[storyId] ?? [];
          if (current.includes(chapterId)) {
            return state;
          }
          return {
            unlockedChapters: {
              ...state.unlockedChapters,
              [storyId]: [...current, chapterId],
            },
          };
        }),
      isChapterUnlocked: (storyId, chapterId) => {
        const chapters = get().unlockedChapters[storyId] ?? [];
        return chapters.includes(chapterId);
      },
    }),
    {
      name: "paywall-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);



