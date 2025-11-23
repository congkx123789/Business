import Foundation

struct ForumThread: Codable, Identifiable {
    let id: String
    let storyId: String
    let title: String
    let category: String
    let author: CommentAuthor
    let isPinned: Bool
    let isLocked: Bool
    let repliesCount: Int
    let lastActivityAt: Date
    let createdAt: Date
    let posts: [ForumPost]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case title
        case category
        case author
        case isPinned = "is_pinned"
        case isLocked = "is_locked"
        case repliesCount = "replies_count"
        case lastActivityAt = "last_activity_at"
        case createdAt = "created_at"
        case posts
    }
}

struct ForumPost: Codable, Identifiable {
    let id: String
    let threadId: String
    let content: String
    let author: CommentAuthor
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case threadId = "thread_id"
        case content
        case author
        case createdAt = "created_at"
    }
}

struct ForumThreadInput {
    let storyId: String
    let title: String
    let category: String
    let content: String
    
    var variables: [String: Any] {
        [
            "storyId": storyId,
            "title": title,
            "category": category,
            "content": content
        ]
    }
}

struct ForumPostInput {
    let threadId: String
    let content: String
    
    var variables: [String: Any] {
        [
            "threadId": threadId,
            "content": content
        ]
    }
}


