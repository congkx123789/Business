import Foundation

// Reading Progress model - CRITICAL for cross-device sync
struct ReadingProgress: Codable {
    let id: String?
    let userId: String
    let storyId: String
    let chapterId: String
    let position: Double // 0.0 - 1.0 (scroll position or page number)
    let completedAt: Date?
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
        case position
        case completedAt = "completed_at"
        case syncedAt = "synced_at"
        case syncStatus = "sync_status"
    }
}

