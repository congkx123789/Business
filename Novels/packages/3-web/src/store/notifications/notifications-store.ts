// Notifications store (client state)
// Stores UI state for notifications (filter, unread count, preferences, etc.)
// Note: Actual notification data is stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface NotificationPreference {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface NotificationUIState {
  unreadCount: number;
  unreadIds: string[];
  lastFetchedAt?: string;
  lastOpenedAt?: string;
  filter: "all" | "unread" | "mentions" | "system" | "rewards";
  preferences: NotificationPreference;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  setFilter: (filter: NotificationUIState["filter"]) => void;
  updatePreferences: (preferences: Partial<NotificationPreference>) => void;
  setLastFetchedAt: (date: Date) => void;
  trackOpen: () => void;
}

export const useNotificationsStore = create<NotificationUIState>()(
  persist(
    (set) => ({
      unreadCount: 0,
      unreadIds: [],
      filter: "all",
      preferences: {
        email: true,
        push: true,
        sms: false,
      },
      setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
      incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
      markAsRead: (notificationId) =>
        set((state) => ({
          unreadIds: state.unreadIds.filter((id) => id !== notificationId),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),
      markAllAsRead: () =>
        set({
          unreadIds: [],
          unreadCount: 0,
        }),
      setFilter: (filter) => set({ filter }),
      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...preferences,
          },
        })),
      setLastFetchedAt: (date) => set({ lastFetchedAt: date.toISOString() }),
      trackOpen: () =>
        set({
          lastOpenedAt: new Date().toISOString(),
          unreadIds: [],
          unreadCount: 0,
        }),
    }),
    {
      name: "notifications-ui-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
