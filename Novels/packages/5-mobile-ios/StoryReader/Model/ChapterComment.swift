import Foundation

struct ChapterComment: Codable, Identifiable {
    let id: String
    let chapterId: String
    let storyId: String
    let content: String
    let author: CommentAuthor
    var likes: Int
    var dislikes: Int
    var replies: [ChapterCommentReply]
    let isAuthor: Bool
    let createdAt: Date
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case chapterId = "chapter_id"
        case storyId = "story_id"
        case content
        case author
        case likes
        case dislikes
        case replies
        case isAuthor = "is_author"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

struct ChapterCommentReply: Codable, Identifiable {
    let id: String
    let parentCommentId: String
    let chapterId: String
    let content: String
    let author: CommentAuthor
    let createdAt: Date
    let isAuthor: Bool
    
    enum CodingKeys: String, CodingKey {
        case id
        case parentCommentId = "parent_comment_id"
        case chapterId = "chapter_id"
        case content
        case author
        case createdAt = "created_at"
        case isAuthor = "is_author"
    }
}

enum ChapterCommentSort: String, Codable, CaseIterable {
    case newest
    case oldest
    case mostLiked = "most_liked"
}

enum ChapterCommentVote: String, Codable {
    case up
    case down
}

struct ChapterCommentInput {
    let chapterId: String
    let storyId: String
    let content: String
    
    var variables: [String: Any] {
        [
            "chapterId": chapterId,
            "storyId": storyId,
            "content": content
        ]
    }
}

struct ChapterCommentReplyInput {
    let chapterId: String
    let commentId: String
    let content: String
    
    var variables: [String: Any] {
        [
            "chapterId": chapterId,
            "commentId": commentId,
            "content": content
        ]
    }
}

struct ChapterCommentVoteResult: Codable {
    let commentId: String
    let likes: Int
    let dislikes: Int
    
    enum CodingKeys: String, CodingKey {
        case commentId = "comment_id"
        case likes
        case dislikes
    }
}


