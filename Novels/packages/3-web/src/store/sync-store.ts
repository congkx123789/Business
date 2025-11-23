// Sync store - Zustand store for sync state
import { create } from "zustand";
import { SyncStatus } from "@/components/shared/SyncStatusIndicator";

interface SyncState {
  status: SyncStatus;
  lastSyncTime: Date | null;
  conflicts: Array<{
    id: string;
    type: "library" | "reading-progress" | "bookmark" | "annotation";
    localValue: unknown;
    remoteValue: unknown;
  }>;
  setStatus: (status: SyncStatus) => void;
  setLastSyncTime: (time: Date) => void;
  addConflict: (conflict: SyncState["conflicts"][0]) => void;
  resolveConflict: (conflictId: string) => void;
  clearConflicts: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  status: "synced",
  lastSyncTime: null,
  conflicts: [],
  setStatus: (status) => set({ status }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  addConflict: (conflict) =>
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
      status: "conflict" as SyncStatus,
    })),
  resolveConflict: (conflictId) =>
    set((state) => ({
      conflicts: state.conflicts.filter((c) => c.id !== conflictId),
      status: state.conflicts.length === 1 ? "synced" : state.status,
    })),
  clearConflicts: () => set({ conflicts: [], status: "synced" }),
}));

