import Foundation
import Combine

// Tag Repository - Offline-first pattern (Rule #8)
class TagRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func getTags(userId: String) -> AnyPublisher<[Tag], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localTags = try self.offlineService.getTags(userId: userId)
                promise(.success(localTags))
                
                // 2. Sync from network in background
                Task {
                    do {
                        try await self.syncService.syncTags(userId: userId)
                    } catch {
                        print("Tag sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func createTag(userId: String, name: String, color: String?, icon: String?, parentTagId: String?) -> AnyPublisher<Tag, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let newTag = try await self.graphQLService.createTag(userId: userId, name: name, color: color, icon: icon, parentTagId: parentTagId)
                    // Save to Core Data
                    try self.offlineService.saveTag(newTag)
                    promise(.success(newTag))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updateTag(userId: String, tagId: String, name: String?, color: String?, icon: String?) -> AnyPublisher<Tag, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let updatedTag = try await self.graphQLService.updateTag(userId: userId, tagId: tagId, name: name, color: color, icon: icon)
                    // Update Core Data
                    try self.offlineService.saveTag(updatedTag)
                    promise(.success(updatedTag))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func deleteTag(userId: String, tagId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.deleteTag(userId: userId, tagId: tagId)
                    // Delete from Core Data
                    try self.offlineService.deleteTag(tagId: tagId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func applyTagToLibrary(userId: String, libraryId: String, tagId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.applyTagToLibrary(userId: userId, libraryId: libraryId, tagId: tagId)
                    // Update Core Data
                    try self.offlineService.updateLibraryItemTags(libraryId: libraryId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


