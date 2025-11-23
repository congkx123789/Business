export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    username?: string;
}
export declare class PaginationQueryDto {
    page?: number;
    limit?: number;
}
export declare class CreateBookDto {
    title: string;
    author?: string;
    description?: string;
}
export declare class UpdateBookDto {
    title?: string;
    author?: string;
    description?: string;
}
export declare class CreateChapterDto {
    bookId: number;
    title: string;
    content: string;
    order?: number;
}
export declare class CreateCommentDto {
    bookId: number;
    content: string;
}
//# sourceMappingURL=index.d.ts.map