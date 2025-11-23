import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SearchQuery } from "@/lib/desktop/search/query-builder";
import {
  cloneQuery,
  createEmptyQuery,
  createEmptyGroup,
  createEmptyCondition,
} from "@/lib/desktop/search/query-builder";
import type { SavedFilter } from "@/lib/desktop/search/saved-filters";
import {
  createSavedFilter,
  ensureUniqueName,
  mergeSavedFilters,
  updateSavedFilter,
} from "@/lib/desktop/search/saved-filters";

interface SearchFiltersState {
  query: SearchQuery;
  appliedQuery: SearchQuery | null;
  savedFilters: SavedFilter[];
  activeFilterId: string | null;
  setQuery: (query: SearchQuery) => void;
  resetQuery: () => void;
  applyCurrentQuery: () => void;
  clearAppliedQuery: () => void;
  saveCurrentFilter: (name: string) => SavedFilter;
  deleteFilter: (filterId: string) => void;
  renameFilter: (filterId: string, name: string) => void;
  setActiveFilter: (filterId: string | null) => void;
  hydrateFilters: (filters: SavedFilter[]) => void;
  ensureDefaultCondition: () => void;
}

const STORAGE_KEY = "advanced-search-storage";

export const useSearchFiltersStore = create<SearchFiltersState>()(
  persist(
    (set, get) => ({
      query: createEmptyQuery(),
      appliedQuery: null,
      savedFilters: [],
      activeFilterId: null,
      setQuery: (query) => set({ query: cloneQuery(query) }),
      resetQuery: () =>
        set({
          query: createEmptyQuery(),
          activeFilterId: null,
        }),
      applyCurrentQuery: () =>
        set({
          appliedQuery: cloneQuery(get().query),
        }),
      clearAppliedQuery: () =>
        set({
          appliedQuery: null,
          activeFilterId: null,
        }),
      saveCurrentFilter: (name) => {
        const state = get();
        const finalName = ensureUniqueName(name, state.savedFilters);
        const filter = createSavedFilter(finalName, state.query);
        set({
          savedFilters: [filter, ...state.savedFilters],
        });
        return filter;
      },
      deleteFilter: (filterId) => {
        set((state) => ({
          savedFilters: state.savedFilters.filter((filter) => filter.id !== filterId),
          activeFilterId: state.activeFilterId === filterId ? null : state.activeFilterId,
        }));
      },
      renameFilter: (filterId, name) => {
        set((state) => {
          const finalName = ensureUniqueName(name, state.savedFilters.filter((f) => f.id !== filterId));
          return {
            savedFilters: state.savedFilters.map((filter) =>
              filter.id === filterId ? updateSavedFilter(filter, { name: finalName }) : filter
            ),
          };
        });
      },
      setActiveFilter: (filterId) => {
        if (!filterId) {
          set({ activeFilterId: null });
          return;
        }

        const filter = get().savedFilters.find((saved) => saved.id === filterId);
        if (!filter) {
          return;
        }

        set({
          activeFilterId: filterId,
          query: cloneQuery(filter.query),
        });
      },
      hydrateFilters: (filters) =>
        set((state) => ({
          savedFilters: mergeSavedFilters(state.savedFilters, filters),
        })),
      ensureDefaultCondition: () =>
        set((state) => {
          if (state.query.groups.length === 0) {
            return { query: createEmptyQuery() };
          }

          const updatedGroups = state.query.groups.map((group) =>
            group.conditions.length === 0
              ? { ...group, conditions: [createEmptyCondition()] }
              : group
          );

          return { query: { ...state.query, groups: updatedGroups } };
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);



