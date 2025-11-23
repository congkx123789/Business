// Bookshelf store (client state)
// Stores UI state for bookshelf management (selected bookshelf, filters, etc.)
// Note: Actual bookshelf data is stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface BookshelfUIState {
  selectedBookshelfId: string | null;
  bookshelfFilter: string | null;
  setSelectedBookshelf: (bookshelfId: string | null) => void;
  setBookshelfFilter: (filter: string | null) => void;
}

export const useBookshelfUIStore = create<BookshelfUIState>()(
  persist(
    (set) => ({
      selectedBookshelfId: null,
      bookshelfFilter: null,
      setSelectedBookshelf: (bookshelfId) => {
        set({ selectedBookshelfId: bookshelfId });
      },
      setBookshelfFilter: (filter) => {
        set({ bookshelfFilter: filter });
      },
    }),
    {
      name: "bookshelf-ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

