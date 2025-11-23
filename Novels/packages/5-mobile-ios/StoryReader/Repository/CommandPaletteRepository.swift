import Foundation
import Combine

// Command Palette Repository
class CommandPaletteRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func search(query: String) -> AnyPublisher<[CommandPaletteViewModel.CommandResult], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    // Search across stories, chapters, annotations, settings
                    let results = try await self.offlineService.searchCommandPalette(query: query)
                    promise(.success(results))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


