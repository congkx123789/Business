import Foundation

// Chapter model - Converted from 7-shared ChapterDto
struct Chapter: Codable, Identifiable {
    let id: String
    let storyId: String
    let title: String
    let content: String? // Content may be nil if not downloaded
    let contentPath: String? // Path to encrypted content file
    let index: Int
    let wordCount: Int?
    let isLocked: Bool
    let price: Int? // Price in points
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case title, content
        case contentPath = "content_path"
        case index
        case wordCount = "word_count"
        case isLocked = "is_locked"
        case price
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

