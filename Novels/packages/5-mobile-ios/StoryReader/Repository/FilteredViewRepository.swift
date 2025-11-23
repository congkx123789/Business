import Foundation
import Combine

// FilteredView Repository - Offline-first pattern (Rule #8)
class FilteredViewRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func getFilteredViews(userId: String) -> AnyPublisher<[FilteredView], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localViews = try self.offlineService.getFilteredViews(userId: userId)
                promise(.success(localViews))
                
                // 2. Sync from network in background
                Task {
                    do {
                        try await self.syncService.syncFilteredViews(userId: userId)
                    } catch {
                        print("FilteredView sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func createFilteredView(userId: String, name: String, description: String?, query: FilterQuery, isAutoUpdating: Bool) -> AnyPublisher<FilteredView, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let newView = try await self.graphQLService.createFilteredView(userId: userId, name: name, description: description, query: query, isAutoUpdating: isAutoUpdating)
                    // Save to Core Data
                    try self.offlineService.saveFilteredView(newView)
                    promise(.success(newView))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updateFilteredView(userId: String, viewId: String, name: String?, query: FilterQuery?) -> AnyPublisher<FilteredView, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let updatedView = try await self.graphQLService.updateFilteredView(userId: userId, viewId: viewId, name: name, query: query)
                    // Update Core Data
                    try self.offlineService.saveFilteredView(updatedView)
                    promise(.success(updatedView))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func deleteFilteredView(userId: String, viewId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.deleteFilteredView(userId: userId, viewId: viewId)
                    // Delete from Core Data
                    try self.offlineService.deleteFilteredView(viewId: viewId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func executeFilter(userId: String, query: FilterQuery) -> AnyPublisher<[LibraryItem], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let results = try await self.graphQLService.executeFilter(userId: userId, query: query)
                    promise(.success(results))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


