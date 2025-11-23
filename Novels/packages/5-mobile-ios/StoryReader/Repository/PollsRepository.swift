import Foundation
import Combine

// Polls Repository - Platform interactions: polls
class PollsRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<String, [Poll]>(expirationInterval: 60)
    
    func getPolls(storyId: String) -> AnyPublisher<[Poll], Error> {
        if let cached = cache.value(forKey: storyId) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getPolls(storyId: storyId)
            .handleEvents(receiveOutput: { [weak self] polls in
                self?.cache.insert(polls, forKey: storyId)
            })
            .eraseToAnyPublisher()
    }
    
    func votePoll(pollId: String, optionId: String) -> AnyPublisher<PollVoteResult, Error> {
        graphQLService.votePoll(pollId: pollId, optionId: optionId)
    }
}


