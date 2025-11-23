"use client";

import React, { useEffect } from "react";
import { useMultiWindow } from "@/lib/hooks/desktop/useMultiWindow";
import { useRouter } from "next/navigation";

/**
 * TabPersistence component handles:
 * 1. Restoring tabs from localStorage on mount
 * 2. Syncing tab state to backend (via users-service SyncTabState)
 * 3. Restoring active tab navigation on app restart
 */
export const TabPersistence: React.FC = () => {
  const { tabs, activeTab, switchTab } = useMultiWindow();
  const router = useRouter();

  // Restore active tab navigation on mount
  useEffect(() => {
    if (activeTab && typeof window !== "undefined") {
      // Only restore if we're not already on a reader page
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/reader/")) {
        if (activeTab.chapterId) {
          router.replace(`/reader/${activeTab.storyId}/${activeTab.chapterId}`);
        } else {
          router.replace(`/reader/${activeTab.storyId}`);
        }
      }
    }
  }, [activeTab, router]);

  // Sync tabs to backend
  useEffect(() => {
    const syncTabs = async () => {
      try {
        // Sync tab state to users-service
        // Implementation will be added when users-service API is ready
      } catch (error) {
        console.error("Failed to sync tabs:", error);
      }
    };

    // Debounce sync to avoid too many API calls
    const timeoutId = setTimeout(syncTabs, 1000);
    return () => clearTimeout(timeoutId);
  }, [tabs]);

  return null;
};

