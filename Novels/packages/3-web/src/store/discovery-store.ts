// Discovery store - Zustand store for discovery UI state
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DiscoveryState {
  selectedGenre: string | null;
  sortBy: "recent" | "popular" | "rating" | "title";
  viewMode: "grid" | "list";
  setSelectedGenre: (genre: string | null) => void;
  setSortBy: (sort: DiscoveryState["sortBy"]) => void;
  setViewMode: (mode: DiscoveryState["viewMode"]) => void;
}

export const useDiscoveryStore = create<DiscoveryState>()(
  persist(
    (set) => ({
      selectedGenre: null,
      sortBy: "recent",
      viewMode: "grid",
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: "discovery-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

