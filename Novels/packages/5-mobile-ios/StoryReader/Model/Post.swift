import Foundation

// Post model - Social feed posts
struct Post: Codable, Identifiable {
    let id: String
    let userId: String
    let content: String
    let images: [String]?
    let storyId: String?
    let chapterId: String?
    let groupId: String?
    let likes: Int
    let comments: Int
    let shares: Int
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case content
        case images
        case storyId = "story_id"
        case chapterId = "chapter_id"
        case groupId = "group_id"
        case likes
        case comments
        case shares
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

