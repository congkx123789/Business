import Foundation

struct FanRankingEntry: Codable, Identifiable {
    let id: String
    let userId: String
    let username: String
    let avatarUrl: String?
    let contribution: Int
    let rank: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case username
        case avatarUrl = "avatar_url"
        case contribution
        case rank
    }
}

struct FanRankingPage: Codable {
    let entries: [FanRankingEntry]
    let season: String
    let updatedAt: Date
}

struct AuthorSupportStats: Codable {
    let authorId: String
    let totalSupporters: Int
    let totalTips: Int
    let totalVotes: Int
    let growthRate: Double
    let supporterBreakdown: [SupporterTier]
    
    enum CodingKeys: String, CodingKey {
        case authorId = "author_id"
        case totalSupporters = "total_supporters"
        case totalTips = "total_tips"
        case totalVotes = "total_votes"
        case growthRate = "growth_rate"
        case supporterBreakdown = "supporter_breakdown"
    }
}

struct SupporterTier: Codable, Identifiable {
    let id: String
    let name: String
    let percentage: Double
}


