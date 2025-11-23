// Genre types

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  storyCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

