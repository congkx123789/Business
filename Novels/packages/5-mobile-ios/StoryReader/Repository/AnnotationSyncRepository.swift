import Foundation
import Combine

// Annotation Sync Repository - Annotation sync
class AnnotationSyncRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    func syncAnnotations(userId: String, deviceId: String) -> AnyPublisher<SyncResult, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.syncService.syncAnnotations(userId: userId)
                    // Get synced annotations
                    let annotations = try self.offlineService.getAnnotations(userId: userId)
                    let result = SyncResult(
                        itemCount: annotations.count,
                        conflictCount: 0,
                        lastSyncedAt: Date()
                    )
                    promise(.success(result))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    struct SyncResult {
        let itemCount: Int
        let conflictCount: Int
        let lastSyncedAt: Date
    }
}


