import Foundation

// Annotation model - Text highlights + notes
struct Annotation: Codable, Identifiable {
    let id: String
    let userId: String
    let storyId: String
    let chapterId: String
    let paragraphIndex: Int
    let selectedText: String
    let note: String?
    let color: String? // Hex color
    let tags: [String]?
    let createdAt: Date
    let updatedAt: Date?
    let syncedAt: Date?
    let syncStatus: SyncStatus
    
    enum SyncStatus: String, Codable {
        case synced
        case pending
        case conflict
        case error
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case storyId = "story_id"
        case chapterId = "chapter_id"
        case paragraphIndex = "paragraph_index"
        case selectedText = "selected_text"
        case note, color, tags
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case syncedAt = "synced_at"
        case syncStatus = "sync_status"
    }
}

