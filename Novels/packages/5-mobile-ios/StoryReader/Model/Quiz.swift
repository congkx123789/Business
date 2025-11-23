import Foundation

struct Quiz: Codable, Identifiable {
    let id: String
    let storyId: String
    let title: String
    let description: String?
    let reward: Int?
    let durationSeconds: Int?
    let questions: [QuizQuestion]
    let leaderboard: [QuizLeaderboardEntry]?
    
    enum CodingKeys: String, CodingKey {
        case id
        case storyId = "story_id"
        case title
        case description
        case reward
        case durationSeconds = "duration_seconds"
        case questions
        case leaderboard
    }
}

struct QuizQuestion: Codable, Identifiable {
    let id: String
    let prompt: String
    let options: [QuizOption]
    let explanation: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case prompt
        case options
        case explanation
    }
}

struct QuizOption: Codable, Identifiable {
    let id: String
    let text: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case text
    }
}

struct QuizSubmissionResult: Codable {
    let quizId: String
    let score: Int
    let totalQuestions: Int
    let correctCount: Int
    let rewardEarned: Int?
    let leaderboardRank: Int?
    
    enum CodingKeys: String, CodingKey {
        case quizId = "quiz_id"
        case score
        case totalQuestions = "total_questions"
        case correctCount = "correct_count"
        case rewardEarned = "reward_earned"
        case leaderboardRank = "leaderboard_rank"
    }
}

struct QuizLeaderboardEntry: Codable, Identifiable {
    let id: String
    let userId: String
    let username: String
    let score: Int
    let rank: Int
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case username
        case score
        case rank
    }
}

struct QuizSubmissionInput {
    let quizId: String
    let answers: [String: String] // questionId -> optionId
    
    var variables: [String: Any] {
        [
            "quizId": quizId,
            "answers": answers
        ]
    }
}


