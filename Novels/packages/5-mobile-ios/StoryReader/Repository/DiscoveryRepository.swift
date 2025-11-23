import Foundation
import Combine

// Discovery Repository - Rankings, Editor Picks, Genre Browsing
class DiscoveryRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<CacheKey, [Story]>(expirationInterval: 60 * 10) // 10 minutes
    
    // Get rankings
    func getRankings(rankingType: RankingType, genre: String? = nil, timeRange: TimeRange? = nil) -> AnyPublisher<[Story], Error> {
        let key = CacheKey.rankings(
            type: rankingType.rawValue,
            genre: genre,
            timeRange: timeRange?.rawValue
        )
        
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getRankings(
            rankingType: rankingType.rawValue,
            genre: genre,
            timeRange: timeRange?.rawValue
        )
        .handleEvents(receiveOutput: { [weak self] stories in
            self?.cache.insert(stories, forKey: key)
        })
        .eraseToAnyPublisher()
    }
    
    // Get editor picks
    func getEditorPicks(limit: Int? = nil, genre: String? = nil) -> AnyPublisher<[Story], Error> {
        let key = CacheKey.editorPicks(limit: limit, genre: genre)
        
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getEditorPicks(limit: limit, genre: genre)
            .handleEvents(receiveOutput: { [weak self] stories in
                self?.cache.insert(stories, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    // Get genre stories
    func getGenreStories(genre: String?, page: Int? = nil, limit: Int? = nil) -> AnyPublisher<[Story], Error> {
        let key = CacheKey.genreStories(genre: genre, page: page, limit: limit)
        
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getGenreStories(genre: genre, page: page, limit: limit)
            .handleEvents(receiveOutput: { [weak self] stories in
                self?.cache.insert(stories, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    enum RankingType: String, Codable {
        case monthlyVotes = "monthly_votes"
        case sales = "sales"
        case recommendations = "recommendations"
        case popularity = "popularity"
    }
    
    enum TimeRange: String, Codable {
        case daily
        case weekly
        case monthly
        case allTime = "all_time"
    }
    
    enum RepositoryError: Error {
        case unknown
        case networkError
    }
    
    private enum CacheKey: Hashable {
        case rankings(type: String, genre: String?, timeRange: String?)
        case editorPicks(limit: Int?, genre: String?)
        case genreStories(genre: String?, page: Int?, limit: Int?)
    }
}

