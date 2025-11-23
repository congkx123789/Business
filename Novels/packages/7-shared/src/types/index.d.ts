export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
export interface StoredProcedureResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}
export interface User {
    id: number;
    email: string;
    username?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserProfile extends User {
}
export interface Book {
    id: number;
    title: string;
    author?: string;
    description?: string;
    coverImage?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Chapter {
    id: number;
    bookId: number;
    title: string;
    content: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface Comment {
    id: number;
    bookId: number;
    userId: number;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface LibraryItem {
    id: number;
    userId: number;
    bookId: number;
    addedAt: Date;
}
//# sourceMappingURL=index.d.ts.map