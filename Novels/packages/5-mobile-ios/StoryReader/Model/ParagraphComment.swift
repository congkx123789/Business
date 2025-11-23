import Foundation

// Paragraph Comment model - Duanping (Micro Level)
struct ParagraphComment: Codable, Identifiable {
    let id: String
    let chapterId: String
    let paragraphIndex: Int
    let content: String
    let author: CommentAuthor
    let reactionType: ReactionType?
    let likes: Int
    let createdAt: Date
    let isAuthor: Bool // Story author interaction
    let replies: [ParagraphComment]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case chapterId = "chapter_id"
        case paragraphIndex = "paragraph_index"
        case content, author
        case reactionType = "reaction_type"
        case likes
        case createdAt = "created_at"
        case isAuthor = "is_author"
        case replies
    }
}

struct CommentAuthor: Codable {
    let id: String
    let username: String
    let avatarUrl: String?
    
    enum CodingKeys: String, CodingKey {
        case id, username
        case avatarUrl = "avatar_url"
    }
}

enum ReactionType: String, Codable {
    case like
    case laugh
    case cry
    case angry
    case wow
    case love
}

