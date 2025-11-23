export interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
}

export interface Chapter {
  id: number;
  bookId: number;
  title: string;
  content: string;
  index: number;
}

export interface User {
  id: number;
  email: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}
