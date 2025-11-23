import Foundation
import Combine

// Forums Repository - Discussion forums (macro level)
class ForumsRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<CacheKey, [ForumThread]>(expirationInterval: 60 * 2)
    
    func getThreads(storyId: String, category: String?, page: Int?) -> AnyPublisher<[ForumThread], Error> {
        let key = CacheKey(storyId: storyId, category: category, page: page)
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService
            .getForumThreads(storyId: storyId, category: category, page: page)
            .handleEvents(receiveOutput: { [weak self] threads in
                self?.cache.insert(threads, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    func createThread(_ input: ForumThreadInput) -> AnyPublisher<ForumThread, Error> {
        graphQLService.createForumThread(input: input)
    }
    
    func replyToThread(_ input: ForumPostInput) -> AnyPublisher<ForumPost, Error> {
        graphQLService.replyToForumThread(input: input)
    }
    
    private struct CacheKey: Hashable {
        let storyId: String
        let category: String?
        let page: Int?
    }
}


