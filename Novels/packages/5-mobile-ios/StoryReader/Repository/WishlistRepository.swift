import Foundation
import Combine

// Wishlist Repository - Wishlist sync logic
class WishlistRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func getWishlist(userId: String) -> AnyPublisher<[WishlistItem], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localItems = try self.offlineService.getWishlistItems(userId: userId)
                promise(.success(localItems))
                
                // 2. Sync from network in background
                Task {
                    do {
                        try await self.syncService.syncWishlist(userId: userId)
                    } catch {
                        print("Wishlist sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func addToWishlist(userId: String, storyId: String, priority: Int? = nil, notes: String? = nil) -> AnyPublisher<WishlistItem, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let item = try await self.graphQLService.addToWishlist(userId: userId, storyId: storyId, priority: priority, notes: notes)
                    // Save to Core Data
                    try self.offlineService.saveWishlistItem(item)
                    promise(.success(item))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func removeFromWishlist(userId: String, storyId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.removeFromWishlist(userId: userId, storyId: storyId)
                    // Delete from Core Data
                    try self.offlineService.deleteWishlistItem(storyId: storyId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    struct WishlistItem {
        let id: String
        let userId: String
        let storyId: String
        let priority: Int?
        let notes: String?
        let createdAt: Date
        let updatedAt: Date
    }
}


