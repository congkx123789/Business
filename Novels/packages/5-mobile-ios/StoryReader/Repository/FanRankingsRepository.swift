import Foundation
import Combine

// Fan Rankings Repository
class FanRankingsRepository {
    private let graphQLService = GraphQLService.shared
    
    func getFanRankings(storyId: String?, authorId: String?) -> AnyPublisher<[FanRanking], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let rankings = try await self.graphQLService.getFanRankings(storyId: storyId, authorId: authorId)
                    promise(.success(rankings))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}
