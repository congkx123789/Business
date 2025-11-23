import Foundation
import Combine

// Library Repository - Offline-first pattern (Rule #8)
class LibraryRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    // Get library items - Offline-first: Load from Core Data first, then sync
    func getLibrary(userId: String) -> AnyPublisher<[LibraryItem], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localItems = try self.offlineService.getLibraryItems(userId: userId)
                promise(.success(localItems))
                
                // 2. Sync from network in background
                Task {
                    do {
                        try await self.syncService.syncAll(userId: userId)
                        // After sync, local items are updated, UI will refresh via Combine
                    } catch {
                        print("Sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Add to library
    func addToLibrary(storyId: String, userId: String) -> AnyPublisher<LibraryItem, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            let newItem = LibraryItem(
                id: UUID().uuidString,
                storyId: storyId,
                userId: userId,
                addedAt: Date(),
                lastReadAt: nil,
                readingProgress: nil,
                isCompleted: false,
                tags: nil,
                bookshelfIds: nil,
                syncedAt: nil,
                syncStatus: .pending
            )
            
            do {
                // Save to Core Data immediately
                try self.offlineService.saveLibraryItem(newItem)
                promise(.success(newItem))
                
                // Sync to backend in background
                Task {
                    try? await self.syncService.syncAll(userId: userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Remove from library
    func removeFromLibrary(itemId: String, userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                try self.offlineService.deleteLibraryItem(itemId: itemId)
                promise(.success(()))
                
                // Trigger sync so backend is updated
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

