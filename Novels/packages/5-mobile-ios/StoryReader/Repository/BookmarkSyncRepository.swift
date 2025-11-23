import Foundation
import Combine

// Bookmark Sync Repository - Bookmark sync
class BookmarkSyncRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func syncBookmarks(userId: String, deviceId: String) -> AnyPublisher<SyncResult, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.syncService.syncBookmarks(userId: userId)
                    // Get synced bookmarks
                    let bookmarks = try self.offlineService.getBookmarks(userId: userId)
                    let result = SyncResult(
                        itemCount: bookmarks.count,
                        conflictCount: 0,
                        lastSyncedAt: Date()
                    )
                    promise(.success(result))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    struct SyncResult {
        let itemCount: Int
        let conflictCount: Int
        let lastSyncedAt: Date
    }
}


