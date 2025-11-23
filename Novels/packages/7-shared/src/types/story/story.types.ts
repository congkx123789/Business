// Story types

import type { Genre } from './genre.types';

export interface Story {
  id: string;
  title: string;
  author?: string;
  authorId?: string;
  description?: string;
  coverImage?: string;
  genreId?: string;
  genre?: Genre;
  status: 'ongoing' | 'completed' | 'hiatus';
  totalChapters: number;
  totalViews: number;
  totalReads: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  storyId: string;
  title: string;
  content: string;
  chapterNumber: number;
  characterCount: number;
  wordCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  isFree: boolean;
  price?: number; // In points
  createdAt: Date;
  updatedAt: Date;
}

