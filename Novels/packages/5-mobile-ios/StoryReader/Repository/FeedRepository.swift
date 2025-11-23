import Foundation
import Combine

// Feed Repository - Offline-first pattern (Rule #8)
class FeedRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func getFeed(userId: String, page: Int = 0) -> AnyPublisher<[FeedViewModel.FeedItem], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    // For feed, we typically want fresh data from network
                    // But we can cache recent items in Core Data for offline viewing
                    let feedItems = try await self.graphQLService.getFeed(userId: userId, page: page)
                    
                    // Cache first page for offline viewing
                    if page == 0 {
                        try? self.offlineService.cacheFeedItems(feedItems)
                    }
                    
                    promise(.success(feedItems))
                } catch {
                    // If network fails, try to load from cache
                    if page == 0 {
                        do {
                            let cachedItems = try self.offlineService.getCachedFeedItems()
                            promise(.success(cachedItems))
                        } catch {
                            promise(.failure(error))
                        }
                    } else {
                        promise(.failure(error))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


