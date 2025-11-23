import Foundation
import Combine

// Annotation Repository - Offline-first with sync
class AnnotationRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    private let syncService = SyncService.shared
    
    // Get annotations - Offline-first
    func getAnnotations(userId: String, storyId: String?, chapterId: String?) -> AnyPublisher<[Annotation], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localAnnotations = try self.offlineService.getAnnotations(userId: userId, storyId: storyId, chapterId: chapterId)
                promise(.success(localAnnotations))
                
                // 2. Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Create annotation
    func createAnnotation(_ annotation: Annotation) -> AnyPublisher<Annotation, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // Save to Core Data immediately (offline-first)
                try self.offlineService.saveAnnotation(annotation)
                promise(.success(annotation))
                
                // Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: annotation.userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Update annotation
    func updateAnnotation(_ annotation: Annotation) -> AnyPublisher<Annotation, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // Update in Core Data immediately
                try self.offlineService.saveAnnotation(annotation)
                promise(.success(annotation))
                
                // Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: annotation.userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Delete annotation
    func deleteAnnotation(annotationId: String, userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // Delete from Core Data immediately
                try self.offlineService.deleteAnnotation(annotationId: annotationId)
                promise(.success(()))
                
                // Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: userId)
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    enum RepositoryError: Error {
        case unknown
        case notFound
        case syncFailed
    }
}

