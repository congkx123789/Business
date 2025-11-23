import Foundation
import Combine

class AuthorSupportRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<String, AuthorSupportStats>(expirationInterval: 60 * 10)
    
    func getAuthorSupport(authorId: String) -> AnyPublisher<AuthorSupportStats, Error> {
        if let cached = cache.value(forKey: authorId) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getAuthorSupportStats(authorId: authorId)
            .handleEvents(receiveOutput: { [weak self] stats in
                self?.cache.insert(stats, forKey: authorId)
            })
            .eraseToAnyPublisher()
    }
}


