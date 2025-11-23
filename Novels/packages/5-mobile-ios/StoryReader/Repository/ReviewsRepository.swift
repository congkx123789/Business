import Foundation
import Combine

// Reviews Repository - Macro level reviews
class ReviewsRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<CacheKey, [Review]>(expirationInterval: 60 * 5)
    
    func getReviews(storyId: String, sort: ReviewSort) -> AnyPublisher<[Review], Error> {
        let key = CacheKey(storyId: storyId, sort: sort)
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getReviews(storyId: storyId, sort: sort)
            .handleEvents(receiveOutput: { [weak self] reviews in
                self?.cache.insert(reviews, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    func createReview(_ input: ReviewInput) -> AnyPublisher<Review, Error> {
        graphQLService.createReview(input: input)
    }
    
    func voteReview(reviewId: String, helpful: Bool) -> AnyPublisher<ReviewHelpfulVoteResult, Error> {
        graphQLService.voteReviewHelpful(reviewId: reviewId, helpful: helpful)
    }
    
    private struct CacheKey: Hashable {
        let storyId: String
        let sort: ReviewSort
    }
}


