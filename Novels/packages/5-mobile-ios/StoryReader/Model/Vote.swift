import Foundation

struct VoteBalance: Codable {
    let availableVotes: Int
    let bonusVotes: Int
    let lastResetAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case availableVotes = "available_votes"
        case bonusVotes = "bonus_votes"
        case lastResetAt = "last_reset_at"
    }
}

struct VoteHistoryItem: Codable, Identifiable {
    let id: String
    let storyId: String
    let storyTitle: String
    let votes: Int
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case storyTitle = "story_title"
        case votes
        case createdAt = "created_at"
    }
}


