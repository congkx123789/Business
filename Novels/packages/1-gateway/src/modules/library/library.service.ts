import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { Observable } from "rxjs";
import {
  GrpcPaginatedResponse,
  GrpcResponse,
} from "../../common/types/grpc.types";
import {
  getGrpcDataOrThrow,
  getGrpcResultOrThrow,
} from "../../common/utils/grpc.util";

interface UsersServiceClient {
  GetUserLibrary(data: {
    userId: number;
    page?: number;
    limit?: number;
    bookshelfId?: number;
    tags?: string;
    layout?: string;
    sort?: string;
  }): Observable<GrpcPaginatedResponse<any[]>>;
  AddToLibrary(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
  RemoveFromLibrary(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<boolean>>;
  UpdateLibraryItem(data: {
    userId: number;
    libraryId: number;
    tags?: string[];
    notes?: string;
  }): Observable<GrpcResponse<any>>;
  SyncLibrary(data: {
    userId: number;
    deviceId?: string;
  }): Observable<GrpcResponse<any>>;
  DownloadStory(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
  GetDownloadStatus(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
  CancelDownload(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
  ListDownloads(data: {
    userId: number;
  }): Observable<GrpcResponse<any>>;
  GetBookshelves(data: {
    userId: number;
  }): Observable<GrpcResponse<any>>;
  CreateBookshelf(data: {
    userId: number;
    name: string;
    description?: string;
  }): Observable<GrpcResponse<any>>;
  UpdateBookshelf(data: {
    userId: number;
    bookshelfId: number;
    name?: string;
    description?: string;
  }): Observable<GrpcResponse<any>>;
  DeleteBookshelf(data: {
    userId: number;
    bookshelfId: number;
  }): Observable<GrpcResponse<any>>;
  AddToBookshelf(data: {
    userId: number;
    bookshelfId: number;
    libraryId: number;
  }): Observable<GrpcResponse<any>>;
  RemoveFromBookshelf(data: {
    userId: number;
    bookshelfId: number;
    libraryId: number;
  }): Observable<GrpcResponse<any>>;
  ReorderBookshelf(data: {
    userId: number;
    bookshelfId: number;
    items: Array<{ libraryId: number; position: number }>;
  }): Observable<GrpcResponse<any>>;
  GetWishlist(data: {
    userId: number;
  }): Observable<GrpcResponse<any>>;
  AddToWishlist(data: {
    userId: number;
    storyId: number;
    priority?: number;
    notes?: string;
  }): Observable<GrpcResponse<any>>;
  RemoveFromWishlist(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
  MoveWishlistToLibrary(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
  GetReadingProgress(data: {
    userId: number;
    storyId?: number;
  }): Observable<GrpcResponse<any>>;
  UpdateReadingProgress(data: {
    userId: number;
    storyId: number;
    chapterId: number;
    progress: number;
  }): Observable<GrpcResponse<any>>;
  SyncReadingProgress(data: {
    userId: number;
    deviceId?: string;
  }): Observable<GrpcResponse<any>>;
  MarkStoryCompleted(data: {
    userId: number;
    storyId: number;
  }): Observable<GrpcResponse<any>>;
}

@Injectable()
export class LibraryService implements OnModuleInit {
  private usersService!: UsersServiceClient;

  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService =
      this.usersClient.getService<UsersServiceClient>("UsersService");
  }

  getUserLibrary(
    userId: number,
    options: {
      page?: number;
      limit?: number;
      bookshelfId?: number;
      tags?: string;
      layout?: string;
      sort?: string;
    },
  ) {
    return getGrpcResultOrThrow(
      this.usersService.GetUserLibrary({ userId, ...options }),
      "Failed to load library",
    );
  }

  addToLibrary(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.AddToLibrary({ userId, storyId }),
      "Failed to add story to library",
    );
  }

  removeFromLibrary(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.RemoveFromLibrary({ userId, storyId }),
      "Failed to remove story from library",
    );
  }

  updateLibraryItem(
    userId: number,
    libraryId: number,
    payload: { tags?: string[]; notes?: string },
  ) {
    return getGrpcDataOrThrow(
      this.usersService.UpdateLibraryItem({ userId, libraryId, ...payload }),
      "Failed to update library item",
    );
  }

  syncLibrary(userId: number, deviceId?: string) {
    return getGrpcDataOrThrow(
      this.usersService.SyncLibrary({ userId, deviceId }),
      "Failed to sync library",
    );
  }

  downloadStory(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.DownloadStory({ userId, storyId }),
      "Failed to start download",
    );
  }

  getDownloadStatus(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetDownloadStatus({ userId, storyId }),
      "Failed to get download status",
    );
  }

  cancelDownload(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.CancelDownload({ userId, storyId }),
      "Failed to cancel download",
    );
  }

  listDownloads(userId: number) {
    return getGrpcDataOrThrow(
      this.usersService.ListDownloads({ userId }),
      "Failed to load downloads",
    );
  }

  getBookshelves(userId: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetBookshelves({ userId }),
      "Failed to load bookshelves",
    );
  }

  createBookshelf(
    userId: number,
    payload: { name: string; description?: string },
  ) {
    return getGrpcDataOrThrow(
      this.usersService.CreateBookshelf({ userId, ...payload }),
      "Failed to create bookshelf",
    );
  }

  updateBookshelf(
    userId: number,
    bookshelfId: number,
    payload: { name?: string; description?: string },
  ) {
    return getGrpcDataOrThrow(
      this.usersService.UpdateBookshelf({ userId, bookshelfId, ...payload }),
      "Failed to update bookshelf",
    );
  }

  deleteBookshelf(userId: number, bookshelfId: number) {
    return getGrpcDataOrThrow(
      this.usersService.DeleteBookshelf({ userId, bookshelfId }),
      "Failed to delete bookshelf",
    );
  }

  addToBookshelf(userId: number, bookshelfId: number, libraryId: number) {
    return getGrpcDataOrThrow(
      this.usersService.AddToBookshelf({ userId, bookshelfId, libraryId }),
      "Failed to add item to bookshelf",
    );
  }

  removeFromBookshelf(userId: number, bookshelfId: number, libraryId: number) {
    return getGrpcDataOrThrow(
      this.usersService.RemoveFromBookshelf({ userId, bookshelfId, libraryId }),
      "Failed to remove item from bookshelf",
    );
  }

  reorderBookshelf(
    userId: number,
    bookshelfId: number,
    items: Array<{ libraryId: number; position: number }>,
  ) {
    return getGrpcDataOrThrow(
      this.usersService.ReorderBookshelf({ userId, bookshelfId, items }),
      "Failed to reorder bookshelf",
    );
  }

  getWishlist(userId: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetWishlist({ userId }),
      "Failed to load wishlist",
    );
  }

  addToWishlist(
    userId: number,
    payload: { storyId: number; priority?: number; notes?: string },
  ) {
    return getGrpcDataOrThrow(
      this.usersService.AddToWishlist({ userId, ...payload }),
      "Failed to add to wishlist",
    );
  }

  removeFromWishlist(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.RemoveFromWishlist({ userId, storyId }),
      "Failed to remove from wishlist",
    );
  }

  moveWishlistToLibrary(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.MoveWishlistToLibrary({ userId, storyId }),
      "Failed to move wishlist item to library",
    );
  }

  getReadingProgress(userId: number, storyId?: number) {
    return getGrpcDataOrThrow(
      this.usersService.GetReadingProgress({ userId, storyId }),
      "Failed to load reading progress",
    );
  }

  updateReadingProgress(
    userId: number,
    payload: { storyId: number; chapterId: number; progress: number },
  ) {
    return getGrpcDataOrThrow(
      this.usersService.UpdateReadingProgress({ userId, ...payload }),
      "Failed to update reading progress",
    );
  }

  syncReadingProgress(userId: number, deviceId?: string) {
    return getGrpcDataOrThrow(
      this.usersService.SyncReadingProgress({ userId, deviceId }),
      "Failed to sync reading progress",
    );
  }

  markStoryCompleted(userId: number, storyId: number) {
    return getGrpcDataOrThrow(
      this.usersService.MarkStoryCompleted({ userId, storyId }),
      "Failed to mark story completed",
    );
  }
}
