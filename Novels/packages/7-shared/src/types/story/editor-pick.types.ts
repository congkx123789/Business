// Editor's Pick types

import type { Story } from './story.types';

export interface EditorPick {
  id: string;
  storyId: string;
  story?: Story;
  priority: number; // Higher = more prominent
  featuredUntil?: Date;
  bannerImage?: string;
  description?: string;
  featuredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

