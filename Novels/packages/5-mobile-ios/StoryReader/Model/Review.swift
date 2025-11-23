import Foundation

struct Review: Codable, Identifiable {
    let id: String
    let storyId: String
    let userId: String
    let rating: Double
    let ratings: ReviewRatings?
    let title: String?
    let content: String
    var helpfulCount: Int
    var notHelpfulCount: Int
    let isFeatured: Bool
    let createdAt: Date
    let updatedAt: Date?
    let author: CommentAuthor
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case userId = "user_id"
        case rating
        case ratings
        case title
        case content
        case helpfulCount = "helpful_count"
        case notHelpfulCount = "not_helpful_count"
        case isFeatured = "is_featured"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case author
    }
}

struct ReviewRatings: Codable {
    let plot: Double?
    let characters: Double?
    let worldBuilding: Double?
    let pacing: Double?
    let writingStyle: Double?
}

enum ReviewSort: String, CaseIterable, Codable {
    case mostRecent = "most_recent"
    case mostHelpful = "most_helpful"
    case highestRated = "highest_rated"
}

struct ReviewInput {
    let storyId: String
    let rating: Double
    let title: String?
    let content: String
    let ratings: ReviewRatings?
    
    var variables: [String: Any] {
        var dict: [String: Any] = [
            "storyId": storyId,
            "rating": rating,
            "content": content
        ]
        if let title = title { dict["title"] = title }
        if let ratings = ratings {
            var ratingDict: [String: Any] = [:]
            if let plot = ratings.plot { ratingDict["plot"] = plot }
            if let characters = ratings.characters { ratingDict["characters"] = characters }
            if let worldBuilding = ratings.worldBuilding { ratingDict["worldBuilding"] = worldBuilding }
            if let pacing = ratings.pacing { ratingDict["pacing"] = pacing }
            if let writingStyle = ratings.writingStyle { ratingDict["writingStyle"] = writingStyle }
            dict["ratings"] = ratingDict
        }
        return dict
    }
}

struct ReviewHelpfulVoteResult: Codable {
    let reviewId: String
    let helpfulCount: Int
    let notHelpfulCount: Int
    
    enum CodingKeys: String, CodingKey {
        case reviewId = "review_id"
        case helpfulCount = "helpful_count"
        case notHelpfulCount = "not_helpful_count"
    }
}


