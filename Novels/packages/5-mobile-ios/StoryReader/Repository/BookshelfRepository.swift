import Foundation
import Combine

// Bookshelf Repository - Offline-first pattern (Rule #8)
class BookshelfRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func getBookshelves(userId: String) -> AnyPublisher<[Bookshelf], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localBookshelves = try self.offlineService.getBookshelves(userId: userId)
                promise(.success(localBookshelves))
                
                // 2. Sync from network in background
                Task {
                    do {
                        try await self.syncService.syncBookshelves(userId: userId)
                    } catch {
                        print("Bookshelf sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func createBookshelf(userId: String, name: String, description: String?) -> AnyPublisher<Bookshelf, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let newBookshelf = try await self.graphQLService.createBookshelf(userId: userId, name: name, description: description)
                    // Save to Core Data
                    try self.offlineService.saveBookshelf(newBookshelf)
                    promise(.success(newBookshelf))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updateBookshelf(userId: String, bookshelfId: String, name: String?, description: String?) -> AnyPublisher<Bookshelf, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let updatedBookshelf = try await self.graphQLService.updateBookshelf(userId: userId, bookshelfId: bookshelfId, name: name, description: description)
                    // Update Core Data
                    try self.offlineService.saveBookshelf(updatedBookshelf)
                    promise(.success(updatedBookshelf))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func deleteBookshelf(userId: String, bookshelfId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.deleteBookshelf(userId: userId, bookshelfId: bookshelfId)
                    // Delete from Core Data
                    try self.offlineService.deleteBookshelf(bookshelfId: bookshelfId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func addToBookshelf(userId: String, bookshelfId: String, libraryId: String) -> AnyPublisher<BookshelfItem, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let item = try await self.graphQLService.addToBookshelf(userId: userId, bookshelfId: bookshelfId, libraryId: libraryId)
                    // Update Core Data
                    try self.offlineService.updateBookshelfItems(bookshelfId: bookshelfId)
                    promise(.success(item))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func removeFromBookshelf(userId: String, bookshelfId: String, libraryId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.removeFromBookshelf(userId: userId, bookshelfId: bookshelfId, libraryId: libraryId)
                    // Update Core Data
                    try self.offlineService.updateBookshelfItems(bookshelfId: bookshelfId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}

enum RepositoryError: Error {
    case unknown
    case notFound
    case networkError
}


