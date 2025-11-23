import Foundation
import Combine

// Chapter Comments Repository - Chapter-end discussions (Meso level)
class ChapterCommentsRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<CacheKey, [ChapterComment]>(expirationInterval: 60 * 2)
    
    func getChapterComments(chapterId: String, sort: ChapterCommentSort) -> AnyPublisher<[ChapterComment], Error> {
        let key = CacheKey(chapterId: chapterId, sort: sort)
        if let cached = cache.value(forKey: key) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService
            .getChapterComments(chapterId: chapterId, sort: sort)
            .handleEvents(receiveOutput: { [weak self] comments in
                self?.cache.insert(comments, forKey: key)
            })
            .eraseToAnyPublisher()
    }
    
    func createComment(input: ChapterCommentInput) -> AnyPublisher<ChapterComment, Error> {
        graphQLService.createChapterComment(input: input)
    }
    
    func replyToComment(input: ChapterCommentReplyInput) -> AnyPublisher<ChapterComment, Error> {
        graphQLService.replyToChapterComment(input: input)
    }
    
    func voteComment(commentId: String, vote: ChapterCommentVote) -> AnyPublisher<ChapterCommentVoteResult, Error> {
        graphQLService.voteChapterComment(commentId: commentId, vote: vote)
    }
    
    private struct CacheKey: Hashable {
        let chapterId: String
        let sort: ChapterCommentSort
    }
}


