import Foundation
import Combine

// Votes Repository - Votes logic
class VotesRepository {
    private let graphQLService = GraphQLService.shared
    
    struct UserVotes {
        let total: Int
        let powerStones: Int
        let monthlyVotes: Int
    }
    
    func getUserVotes(userId: String) -> AnyPublisher<UserVotes, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let votes = try await self.graphQLService.getUserVotes(userId: userId)
                    promise(.success(votes))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func castPowerStoneVote(storyId: String, userId: String, votes: Int) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.castPowerStoneVote(storyId: storyId, userId: userId, votes: votes)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func castMonthlyVote(storyId: String, userId: String, votes: Int) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.castMonthlyVote(storyId: storyId, userId: userId, votes: votes)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}
