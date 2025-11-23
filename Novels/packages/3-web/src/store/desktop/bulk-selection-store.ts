import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BulkSelectionState {
  selectedIds: string[];
  lastSelectedId: string | null;
  select: (id: string) => void;
  deselect: (id: string) => void;
  toggle: (id: string) => void;
  selectMany: (ids: string[]) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

const toId = (id: string | number) => id.toString();

export const useBulkSelectionStore = create<BulkSelectionState>()(
  persist(
    (set, get) => ({
      selectedIds: [],
      lastSelectedId: null,
      select: (id) =>
        set((state) => {
          const nextId = toId(id);
          if (state.selectedIds.includes(nextId)) {
            return state;
          }
          return {
            selectedIds: [...state.selectedIds, nextId],
            lastSelectedId: nextId,
          };
        }),
      deselect: (id) =>
        set((state) => ({
          selectedIds: state.selectedIds.filter((value) => value !== toId(id)),
          lastSelectedId:
            state.lastSelectedId === toId(id) ? null : state.lastSelectedId,
        })),
      toggle: (id) => {
        const value = toId(id);
        if (get().selectedIds.includes(value)) {
          get().deselect(value);
        } else {
          get().select(value);
        }
      },
      selectMany: (ids) =>
        set((state) => {
          const merged = new Set(state.selectedIds);
          ids.map(toId).forEach((id) => merged.add(id));
          return {
            selectedIds: Array.from(merged),
            lastSelectedId: ids.length ? toId(ids[ids.length - 1]) : state.lastSelectedId,
          };
        }),
      clear: () => set({ selectedIds: [], lastSelectedId: null }),
      isSelected: (id) => get().selectedIds.includes(toId(id)),
    }),
    {
      name: "bulk-selection-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedIds: state.selectedIds,
        lastSelectedId: state.lastSelectedId,
      }),
    }
  )
);


