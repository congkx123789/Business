import Foundation
import Combine

// Reading Stats Repository - Reading statistics
class ReadingStatsRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func getReadingStats(userId: String, timeRange: ReadingStatsViewModel.TimeRange) -> AnyPublisher<ReadingStatsViewModel.ReadingStats, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    // Calculate stats from local data (Core Data)
                    let stats = try self.offlineService.calculateReadingStats(userId: userId, timeRange: timeRange)
                    promise(.success(stats))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


