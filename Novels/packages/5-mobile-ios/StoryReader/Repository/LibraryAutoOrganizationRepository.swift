import Foundation
import Combine

// Library Auto-Organization Repository
class LibraryAutoOrganizationRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func getBooksByAuthor(userId: String) -> AnyPublisher<[LibraryAutoOrganizationViewModel.AuthorGroup], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let groups = try await self.graphQLService.getBooksByAuthor(userId: userId)
                    promise(.success(groups))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getBooksBySeries(userId: String) -> AnyPublisher<[LibraryAutoOrganizationViewModel.SeriesGroup], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let groups = try await self.graphQLService.getBooksBySeries(userId: userId)
                    promise(.success(groups))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getSystemLists(userId: String) -> AnyPublisher<[SystemList], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first
                let localLists = try self.offlineService.getSystemLists(userId: userId)
                promise(.success(localLists))
                
                // 2. Sync from network in background
                Task {
                    do {
                        let remoteLists = try await self.graphQLService.getSystemLists(userId: userId)
                        try? self.offlineService.saveSystemLists(remoteLists)
                    } catch {
                        print("System lists sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
}


