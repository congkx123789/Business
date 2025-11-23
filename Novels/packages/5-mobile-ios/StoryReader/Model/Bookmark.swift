import Foundation

// Bookmark model - Reading positions
struct Bookmark: Codable, Identifiable {
    let id: String
    let userId: String
    let storyId: String
    let chapterId: String
    let position: Double // 0.0 - 1.0
    let note: String?
    let createdAt: Date
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
        case position, note
        case createdAt = "created_at"
        case syncedAt = "synced_at"
        case syncStatus = "sync_status"
    }
}

