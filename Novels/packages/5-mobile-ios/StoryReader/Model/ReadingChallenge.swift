import Foundation

struct ReadingChallenge: Identifiable, Decodable {
    let id: String
    let name: String
    let description: String?
    let challengeType: String
    let goal: Int
    let goalType: String
    let timeRange: String
    let startDate: Date
    let endDate: Date
    let progress: Int
    let status: String
    let isPublic: Bool
}

struct ChallengeParticipant: Identifiable, Decodable {
    var id: String { "\(userId)-\(joinedAt.timeIntervalSince1970)" }
    let userId: String
    let progress: Int
    let joinedAt: Date
    let updatedAt: Date
}

struct ChallengeProgressPayload: Decodable {
    let challenge: ReadingChallenge
    let participants: [ChallengeParticipant]
}

struct ActivityFeedPage: Decodable {
    let items: [ActivityFeedItem]
    let total: Int
    let page: Int
    let limit: Int
}

struct ActivityFeedItem: Identifiable, Decodable {
    let id: String
    let activityType: String
    let timestamp: Date
    let storyId: String?
    let chapterId: String?
    let metadata: [String: String]?
}

struct ReadingGoal: Identifiable, Decodable {
    let id: String
    let goalType: String
    let target: Int
    let current: Int
    let timeRange: String
    let startDate: Date
    let endDate: Date
    let status: String
}

struct ReadingStatistics: Decodable {
    struct ActivityCount: Decodable {
        let activityType: String
        let count: Int
    }
    
    let activityCounts: [ActivityCount]
    let activeGoals: [ReadingGoal]
}

