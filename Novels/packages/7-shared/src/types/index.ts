// Common types shared across all packages

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// Removed StoredProcedureResponse - not used in microservice architecture (uses Prisma ORM)

// Export all domain types
export * from './user';
export * from './story';
export * from './social';
export * from './ai';
export * from './comment';
export * from './monetization';

// Re-export common types (avoiding duplicates)
export type { TimeRange } from './story/ranking.types';
