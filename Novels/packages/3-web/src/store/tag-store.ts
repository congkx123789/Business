// Tag store (client state)
// Stores UI state for tag management (selected tags, tag filters, etc.)
// Note: Actual tag data is stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TagUIState {
  selectedTags: string[];
  tagFilter: string | null;
  tagSearchQuery: string;
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tagId: string) => void;
  setTagFilter: (filter: string | null) => void;
  setTagSearchQuery: (query: string) => void;
  clearTagSelection: () => void;
}

export const useTagUIStore = create<TagUIState>()(
  persist(
    (set) => ({
      selectedTags: [],
      tagFilter: null,
      tagSearchQuery: "",
      setSelectedTags: (tags) => {
        set({ selectedTags: tags });
      },
      toggleTag: (tagId) => {
        set((state) => {
          const isSelected = state.selectedTags.includes(tagId);
          return {
            selectedTags: isSelected
              ? state.selectedTags.filter((id) => id !== tagId)
              : [...state.selectedTags, tagId],
          };
        });
      },
      setTagFilter: (filter) => {
        set({ tagFilter: filter });
      },
      setTagSearchQuery: (query) => {
        set({ tagSearchQuery: query });
      },
      clearTagSelection: () => {
        set({ selectedTags: [] });
      },
    }),
    {
      name: "tag-ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

