import Foundation
import Combine

// Group Repository - Offline-first pattern (Rule #8)
class GroupRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func getGroups(userId: String) -> AnyPublisher<[Group], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localGroups = try self.offlineService.getGroups(userId: userId)
                promise(.success(localGroups))
                
                // 2. Sync from network in background
                Task {
                    do {
                        try await self.syncService.syncGroups(userId: userId)
                    } catch {
                        print("Group sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func createGroup(userId: String, name: String, description: String?, type: Group.GroupType, isPublic: Bool) -> AnyPublisher<Group, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let newGroup = try await self.graphQLService.createGroup(userId: userId, name: name, description: description, type: type, isPublic: isPublic)
                    // Save to Core Data
                    try self.offlineService.saveGroup(newGroup)
                    promise(.success(newGroup))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func joinGroup(userId: String, groupId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.joinGroup(userId: userId, groupId: groupId)
                    // Update Core Data
                    try self.offlineService.updateGroupMembership(groupId: groupId, userId: userId, isMember: true)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getGroupMembers(groupId: String) -> AnyPublisher<[User], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let members = try await self.graphQLService.getGroupMembers(groupId: groupId)
                    promise(.success(members))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


