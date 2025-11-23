import Foundation

// Group model - Book Clubs and general groups
struct Group: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let type: GroupType
    let storyId: String? // For book clubs
    let ownerId: String
    let memberCount: Int
    let isPublic: Bool
    let coverImage: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum GroupType: String, Codable {
        case general
        case bookClub = "book-club"
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case type
        case storyId = "story_id"
        case ownerId = "owner_id"
        case memberCount = "member_count"
        case isPublic = "is_public"
        case coverImage = "cover_image"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// BookClub model - Extends Group
struct BookClub: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let storyId: String
    let ownerId: String
    let memberCount: Int
    let isPublic: Bool
    let coverImage: String?
    let readingSchedule: ReadingSchedule?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case storyId = "story_id"
        case ownerId = "owner_id"
        case memberCount = "member_count"
        case isPublic = "is_public"
        case coverImage = "cover_image"
        case readingSchedule = "reading_schedule"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

