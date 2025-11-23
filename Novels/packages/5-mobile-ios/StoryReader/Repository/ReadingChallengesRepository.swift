import Foundation
import Combine

final class ReadingChallengesRepository {
    private let graphQLService = GraphQLService.shared
    
    func getChallengeProgress(challengeId: String) -> AnyPublisher<ChallengeProgressPayload, Error> {
        graphQLService.getChallengeProgress(challengeId: challengeId)
    }
    
    func getFriendProgress(challengeId: String) -> AnyPublisher<[ChallengeParticipant], Error> {
        graphQLService.getFriendChallengeProgress(challengeId: challengeId)
    }
    
    func updateProgress(challengeId: String, progress: Int) -> AnyPublisher<Bool, Error> {
        graphQLService.updateReadingChallengeProgress(challengeId: challengeId, progress: progress)
    }
    
    func setReadingGoal(goalType: String, target: Int, timeRange: String, startDate: String, endDate: String) -> AnyPublisher<ReadingGoal, Error> {
        graphQLService.setReadingGoal(
            goalType: goalType,
            target: target,
            timeRange: timeRange,
            startDate: startDate,
            endDate: endDate
        )
    }
    
    func getActivityFeed(page: Int = 1, limit: Int = 20) -> AnyPublisher<ActivityFeedPage, Error> {
        graphQLService.getActivityFeed(page: page, limit: limit)
    }
    
    func getReadingStatistics() -> AnyPublisher<ReadingStatistics, Error> {
        graphQLService.getReadingStatistics()
    }
}

