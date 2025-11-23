import Foundation

// Library model - Enhanced with sync support
struct LibraryItem: Codable, Identifiable {
    let id: String
    let storyId: String
    let userId: String
    let addedAt: Date
    let lastReadAt: Date?
    let readingProgress: Double? // 0.0 - 1.0
    let isCompleted: Bool
    let tags: [String]?
    let bookshelfIds: [String]?
    let syncedAt: Date? // Last sync timestamp
    let syncStatus: SyncStatus
    
    enum SyncStatus: String, Codable {
        case synced
        case pending
        case conflict
        case error
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case userId = "user_id"
        case addedAt = "added_at"
        case lastReadAt = "last_read_at"
        case readingProgress = "reading_progress"
        case isCompleted = "is_completed"
        case tags
        case bookshelfIds = "bookshelf_ids"
        case syncedAt = "synced_at"
        case syncStatus = "sync_status"
    }
}

