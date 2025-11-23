// Server state management using React Query / TanStack Query
// This handles all server data fetching, caching, and synchronization

import { QueryClient } from "@tanstack/react-query";

// Create a QueryClient instance with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Refetch on window focus in production
      refetchOnWindowFocus: process.env.NODE_ENV === "production",
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Query keys factory for type-safe query keys
export const queryKeys = {
  // Auth queries
  auth: {
    me: ["auth", "me"] as const,
  },
  // Book queries
  books: {
    all: ["books"] as const,
    lists: () => [...queryKeys.books.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.books.lists(), filters] as const,
    details: () => [...queryKeys.books.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.books.details(), id] as const,
  },
  // Chapter queries
  chapters: {
    all: ["chapters"] as const,
    lists: () => [...queryKeys.chapters.all, "list"] as const,
    list: (bookId: number) => [...queryKeys.chapters.lists(), bookId] as const,
    details: () => [...queryKeys.chapters.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.chapters.details(), id] as const,
  },
  // Library queries
  library: {
    all: ["library"] as const,
    lists: () => [...queryKeys.library.all, "list"] as const,
    list: (userId: number) => [...queryKeys.library.lists(), userId] as const,
  },
  // Comment queries
  comments: {
    all: ["comments"] as const,
    lists: () => [...queryKeys.comments.all, "list"] as const,
    list: (bookId: number) => [...queryKeys.comments.lists(), bookId] as const,
  },
} as const;

