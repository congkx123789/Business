// Library types

import type { Story } from '../story/story.types';

export interface Library {
  id: string;
  userId: string;
  storyId: string;
  story?: Story; // Populated from stories-service via gRPC
  addedAt: Date;
  lastReadAt?: Date;
  lastChapterId?: string;
  isDownloaded: boolean;
  downloadProgress: number; // 0-100
  customTags: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Bookshelf {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  /**
   * @deprecated Use items + Library references instead.
   * Kept for backward compatibility until legacy consumers migrate.
   */
  storyIds?: string[];
  displayOrder: number;
  isDefault: boolean;
  items?: BookshelfItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookshelfItem {
  id: string;
  bookshelfId: string;
  libraryId: string;
  library?: Library;
  displayOrder: number;
  addedAt: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  storyId: string;
  story?: Story; // Populated from stories-service via gRPC
  addedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color?: string;
  icon?: string;
  parentTagId?: string;
  parentTag?: Tag;
  childTags?: Tag[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilteredView {
  id: string;
  userId: string;
  name: string;
  description?: string;
  query: FilterQuery;
  isAutoUpdating: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterQuery {
  tags?: TagFilter;
  authorId?: string;
  seriesId?: string;
  completionStatus?: 'completed' | 'in-progress' | 'not-started';
  progressRange?: ProgressRange;
  dateRange?: DateRange;
  hasHighlights?: boolean;
  hasBookmarks?: boolean;
}

export interface TagFilter {
  operator: 'AND' | 'OR' | 'NOT';
  values: string[];
}

export interface ProgressRange {
  min: number;
  max: number;
}

export interface DateRange {
  field: 'addedAt' | 'lastReadAt' | 'completedAt';
  start: Date;
  end: Date;
}

export interface SystemList {
  id: string;
  userId: string;
  listType:
    | 'favorites'
    | 'to-read'
    | 'have-read'
    | 'currently-reading'
    | 'recently-added';
  libraryItems?: LibrarySystemListItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LibrarySystemListItem {
  id: string;
  libraryId: string;
  systemListId: string;
  createdAt: Date;
}

