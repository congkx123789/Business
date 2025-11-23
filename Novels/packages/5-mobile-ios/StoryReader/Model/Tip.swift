import Foundation

struct Tip: Codable, Identifiable {
    let id: String
    let storyId: String
    let authorId: String?
    let userId: String
    let username: String
    let amount: Int
    let message: String?
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case authorId = "author_id"
        case userId = "user_id"
        case username
        case amount
        case message
        case createdAt = "created_at"
    }
}

struct TipStats: Codable {
    let totalTips: Int
    let totalAmount: Int
    let topSupporters: [TipSupporter]
    
    enum CodingKeys: String, CodingKey {
        case totalTips = "total_tips"
        case totalAmount = "total_amount"
        case topSupporters = "top_supporters"
    }
}

struct TipSupporter: Codable, Identifiable {
    let id: String
    let username: String
    let amount: Int
}


