import Foundation
import Combine

class TippingRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<String, TipStats>(expirationInterval: 60 * 5)
    
    func createTip(storyId: String, amount: Int, message: String?) -> AnyPublisher<Tip, Error> {
        graphQLService.createTip(storyId: storyId, amount: amount, message: message)
    }
    
    func getTippingHistory(storyId: String, limit: Int? = nil) -> AnyPublisher<[Tip], Error> {
        graphQLService.getTippingHistory(storyId: storyId, limit: limit)
    }
    
    func getTipStats(storyId: String) -> AnyPublisher<TipStats, Error> {
        if let cached = cache.value(forKey: storyId) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getTippingStats(storyId: storyId)
            .handleEvents(receiveOutput: { [weak self] stats in
                self?.cache.insert(stats, forKey: storyId)
            })
            .eraseToAnyPublisher()
    }
}


