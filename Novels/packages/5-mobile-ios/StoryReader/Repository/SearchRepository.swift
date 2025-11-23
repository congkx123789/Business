import Foundation
import Combine

// Search Repository - Advanced search logic
class SearchRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func search(query: String, filters: FilterQuery? = nil) -> AnyPublisher<[LibraryItem], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    // Try network search first
                    let results = try await self.graphQLService.searchLibrary(query: query, filters: filters)
                    promise(.success(results))
                } catch {
                    // Fallback to local search
                    do {
                        let localResults = try self.offlineService.searchLibrary(query: query, filters: filters)
                        promise(.success(localResults))
                    } catch {
                        promise(.failure(error))
                    }
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getSearchHistory() -> AnyPublisher<[String], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                let history = try self.offlineService.getSearchHistory()
                promise(.success(history))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getSearchSuggestions(query: String) -> AnyPublisher<[String], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                let suggestions = try self.offlineService.getSearchSuggestions(query: query)
                promise(.success(suggestions))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getFilterPresets() -> AnyPublisher<[AdvancedSearchViewModel.FilterPreset], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                let presets = try self.offlineService.getFilterPresets()
                promise(.success(presets))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func saveFilterPreset(name: String, query: FilterQuery) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                try self.offlineService.saveFilterPreset(name: name, query: query)
                promise(.success(()))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func saveSearchHistory(_ history: [String]) {
        // Save to Core Data asynchronously
        Task {
            try? await self.offlineService.saveSearchHistory(history)
        }
    }
}


