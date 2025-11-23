// Download store (client state)
// Stores UI state for download management (download queue, progress, etc.)
// Note: Actual download data may be stored in server-state via React Query

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DownloadItem {
  storyId: string;
  progress: number; // 0-100
  status: "pending" | "downloading" | "completed" | "failed";
  error?: string;
}

interface DownloadUIState {
  downloadQueue: DownloadItem[];
  isDownloading: boolean;
  addToDownloadQueue: (storyId: string) => void;
  removeFromDownloadQueue: (storyId: string) => void;
  updateDownloadProgress: (storyId: string, progress: number) => void;
  updateDownloadStatus: (storyId: string, status: DownloadItem["status"], error?: string) => void;
  clearCompletedDownloads: () => void;
  setIsDownloading: (isDownloading: boolean) => void;
}

export const useDownloadStore = create<DownloadUIState>()(
  persist(
    (set) => ({
      downloadQueue: [],
      isDownloading: false,
      addToDownloadQueue: (storyId) => {
        set((state) => {
          // Don't add if already in queue
          if (state.downloadQueue.some((item) => item.storyId === storyId)) {
            return state;
          }
          return {
            downloadQueue: [
              ...state.downloadQueue,
              {
                storyId,
                progress: 0,
                status: "pending",
              },
            ],
          };
        });
      },
      removeFromDownloadQueue: (storyId) => {
        set((state) => ({
          downloadQueue: state.downloadQueue.filter((item) => item.storyId !== storyId),
        }));
      },
      updateDownloadProgress: (storyId, progress) => {
        set((state) => ({
          downloadQueue: state.downloadQueue.map((item) =>
            item.storyId === storyId ? { ...item, progress } : item
          ),
        }));
      },
      updateDownloadStatus: (storyId, status, error) => {
        set((state) => ({
          downloadQueue: state.downloadQueue.map((item) =>
            item.storyId === storyId ? { ...item, status, error } : item
          ),
        }));
      },
      clearCompletedDownloads: () => {
        set((state) => ({
          downloadQueue: state.downloadQueue.filter((item) => item.status !== "completed"),
        }));
      },
      setIsDownloading: (isDownloading) => {
        set({ isDownloading });
      },
    }),
    {
      name: "download-ui-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist queue, not progress/status (those are ephemeral)
      partialize: (state) => ({
        downloadQueue: state.downloadQueue.map((item) => ({
          storyId: item.storyId,
          progress: 0,
          status: "pending" as const,
        })),
      }),
    }
  )
);

