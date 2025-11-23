import Foundation
import Combine

// Bulk Operations Repository
class BulkOperationsRepository {
    private let graphQLService = GraphQLService.shared
    
    func deleteBulk(userId: String, itemIds: [String]) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.deleteBulkLibraryItems(userId: userId, itemIds: itemIds)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func moveToBookshelf(userId: String, bookshelfId: String, itemIds: [String]) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.bulkAddToBookshelf(userId: userId, bookshelfId: bookshelfId, itemIds: itemIds)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func applyTags(userId: String, itemIds: [String], tagIds: [String]) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.bulkApplyTags(userId: userId, itemIds: itemIds, tagIds: tagIds)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


