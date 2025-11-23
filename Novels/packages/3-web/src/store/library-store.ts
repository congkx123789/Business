// Library store - Zustand store for library UI state
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface LibraryState {
  selectedItems: string[];
  layout: "grid" | "list";
  sortBy: "recent" | "title" | "progress" | "added";
  filterBy: {
    bookshelf?: string;
    tags?: string[];
    completionStatus?: "all" | "reading" | "completed" | "unread";
  };
  setSelectedItems: (items: string[]) => void;
  toggleItemSelection: (itemId: string) => void;
  clearSelection: () => void;
  setLayout: (layout: LibraryState["layout"]) => void;
  setSortBy: (sort: LibraryState["sortBy"]) => void;
  setFilterBy: (filter: Partial<LibraryState["filterBy"]>) => void;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      selectedItems: [],
      layout: "grid",
      sortBy: "recent",
      filterBy: {
        completionStatus: "all",
      },
      setSelectedItems: (items) => set({ selectedItems: items }),
      toggleItemSelection: (itemId) =>
        set((state) => ({
          selectedItems: state.selectedItems.includes(itemId)
            ? state.selectedItems.filter((id) => id !== itemId)
            : [...state.selectedItems, itemId],
        })),
      clearSelection: () => set({ selectedItems: [] }),
      setLayout: (layout) => set({ layout }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterBy: (filter) =>
        set((state) => ({
          filterBy: { ...state.filterBy, ...filter },
        })),
    }),
    {
      name: "library-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

