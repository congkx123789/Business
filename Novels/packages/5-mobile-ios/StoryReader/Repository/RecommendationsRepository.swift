import Foundation
import Combine

// Recommendations Repository - AI-powered story recommendations
class RecommendationsRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<CacheKey, [Story]>(expirationInterval: 60 * 5) // 5 minutes
    private var cancellables = Set<AnyCancellable>()
    
    // Get personalized recommendations
    func getRecommendations(userId: String, limit: Int? = nil) -> AnyPublisher<[Story], Error> {
        let key = CacheKey.recommendations(userId: userId, limit: limit)
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getRecommendations(userId: userId, limit: limit)
            .handleEvents(receiveOutput: { [weak self] stories in
                self?.cache.insert(stories, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    // Get similar stories
    func getSimilarStories(storyId: String, limit: Int? = nil) -> AnyPublisher<[Story], Error> {
        let key = CacheKey.similar(storyId: storyId, limit: limit)
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getSimilarStories(storyId: storyId, limit: limit)
            .handleEvents(receiveOutput: { [weak self] stories in
                self?.cache.insert(stories, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    // Track user behavior for recommendations
    func trackBehavior(userId: String, storyId: String, action: UserAction) {
        graphQLService.trackUserBehavior(userId: userId, storyId: storyId, action: action.rawValue)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    enum UserAction: String, Codable {
        case view
        case read
        case like
        case share
        case purchase
    }
    
    enum RepositoryError: Error {
        case unknown
        case networkError
    }
    
    private enum CacheKey: Hashable {
        case recommendations(userId: String, limit: Int?)
        case similar(storyId: String, limit: Int?)
    }
}

