import Foundation

struct Poll: Codable, Identifiable {
    let id: String
    let storyId: String
    let question: String
    var options: [PollOption]
    var totalVotes: Int
    let expiresAt: Date?
    var userVoteOptionId: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case question
        case options
        case totalVotes = "total_votes"
        case expiresAt = "expires_at"
        case userVoteOptionId = "user_vote_option_id"
    }
}

struct PollOption: Codable, Identifiable {
    let id: String
    let text: String
    let voteCount: Int
    let percentage: Double
    
    enum CodingKeys: String, CodingKey {
        case id
        case text
        case voteCount = "vote_count"
        case percentage
    }
}

struct PollVoteResult: Codable {
    let pollId: String
    let optionId: String
    let totalVotes: Int
    let options: [PollOption]
    
    enum CodingKeys: String, CodingKey {
        case pollId = "poll_id"
        case optionId = "option_id"
        case totalVotes = "total_votes"
        case options
    }
}


