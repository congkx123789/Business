import Foundation
import Combine

// Paragraph Comments Repository - Duanping feature
class ParagraphCommentsRepository {
    private let graphQLService = GraphQLService.shared
    private let webSocketService = WebSocketService.shared
    
    // Get paragraph comments - Real-time updates via WebSocket
    func getParagraphComments(chapterId: String, paragraphIndex: Int?) -> AnyPublisher<[ParagraphComment], Error> {
        graphQLService.getParagraphComments(chapterId: chapterId, paragraphIndex: paragraphIndex)
    }
    
    // Get comment counts for all paragraphs in a chapter
    func getParagraphCommentCounts(chapterId: String) -> AnyPublisher<[Int: Int], Error> {
        return graphQLService.getParagraphCommentCounts(chapterId: chapterId)
    }
    
    // Create paragraph comment
    func createParagraphComment(chapterId: String, paragraphIndex: Int, content: String, reactionType: ReactionType?) -> AnyPublisher<ParagraphComment, Error> {
        return graphQLService.createParagraphComment(
            chapterId: chapterId,
            paragraphIndex: paragraphIndex,
            content: content,
            reactionType: reactionType
        )
    }
    
    // Like paragraph comment
    func likeParagraphComment(commentId: String) -> AnyPublisher<Void, Error> {
        return graphQLService.likeParagraphComment(commentId: commentId)
    }
    
    // Subscribe to real-time updates
    func subscribeToComments(chapterId: String, onUpdate: @escaping ([ParagraphComment]) -> Void) {
        webSocketService.subscribe("paragraph-comments:\(chapterId)") { event in
            // Parse event data and update comments
            // onUpdate(parsedComments)
        }
    }
    
    enum RepositoryError: Error {
        case unknown
        case networkError
    }
}

