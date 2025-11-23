// Multi-window/tab state store
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Tab {
  id: string;
  storyId: string;
  chapterId?: string;
  title: string;
  pinned: boolean;
  lastAccessed: Date;
}

interface MultiWindowState {
  tabs: Tab[];
  activeTabId: string | null;
  tabOrder: string[];
  openTab: (tab: Omit<Tab, "id" | "lastAccessed">) => string;
  closeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  reorderTabs: (tabIds: string[]) => void;
  pinTab: (tabId: string) => void;
  unpinTab: (tabId: string) => void;
  duplicateTab: (tabId: string) => string;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
}

export const useMultiWindowStore = create<MultiWindowState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      tabOrder: [],
      openTab: (tab) => {
        const id = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTab: Tab = {
          ...tab,
          id,
          lastAccessed: new Date(),
        };
        set((state) => ({
          tabs: [...state.tabs, newTab],
          activeTabId: id,
          tabOrder: [...state.tabOrder, id],
        }));
        return id;
      },
      closeTab: (tabId) => {
        set((state) => {
          const newTabs = state.tabs.filter((t) => t.id !== tabId);
          const newTabOrder = state.tabOrder.filter((id) => id !== tabId);
          const newActiveTabId =
            state.activeTabId === tabId
              ? newTabOrder[newTabOrder.length - 1] || null
              : state.activeTabId;
          return {
            tabs: newTabs,
            activeTabId: newActiveTabId,
            tabOrder: newTabOrder,
          };
        });
      },
      switchTab: (tabId) => {
        set((state) => ({
          activeTabId: tabId,
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, lastAccessed: new Date() } : t
          ),
        }));
      },
      reorderTabs: (tabIds) => {
        set({ tabOrder: tabIds });
      },
      pinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, pinned: true } : t)),
        }));
      },
      unpinTab: (tabId) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, pinned: false } : t)),
        }));
      },
      duplicateTab: (tabId) => {
        const tab = get().tabs.find((t) => t.id === tabId);
        if (!tab) return "";
        return get().openTab({
          storyId: tab.storyId,
          chapterId: tab.chapterId,
          title: `${tab.title} (Copy)`,
          pinned: false,
        });
      },
      updateTab: (tabId, updates) => {
        set((state) => ({
          tabs: state.tabs.map((t) => (t.id === tabId ? { ...t, ...updates } : t)),
        }));
      },
    }),
    {
      name: "multi-window-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

