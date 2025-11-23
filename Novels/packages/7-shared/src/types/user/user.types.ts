// User-related types

export interface User {
  id: string;
  email: string;
  username: string;
  profile?: Profile;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  userId: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

