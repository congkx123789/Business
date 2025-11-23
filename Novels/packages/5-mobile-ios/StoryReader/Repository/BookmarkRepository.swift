import Foundation
import Combine

// Bookmark Repository - Offline-first with sync
class BookmarkRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    // Get bookmarks - Offline-first
    func getBookmarks(userId: String, storyId: String?) -> AnyPublisher<[Bookmark], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localBookmarks = try self.offlineService.getBookmarks(userId: userId, storyId: storyId, chapterId: nil)
                promise(.success(localBookmarks))
                
                // 2. Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Create bookmark
    func createBookmark(_ bookmark: Bookmark) -> AnyPublisher<Bookmark, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // Save to Core Data immediately (offline-first)
                try self.offlineService.saveBookmark(bookmark)
                promise(.success(bookmark))
                
                // Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: bookmark.userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Delete bookmark
    func deleteBookmark(bookmarkId: String, userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // Delete from Core Data immediately
                try self.offlineService.deleteBookmark(bookmarkId: bookmarkId)
                promise(.success(()))
                
                // Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    enum RepositoryError: Error {
        case unknown
        case notFound
        case syncFailed
    }
}

