import Foundation
import Combine

// Reading Progress Repository - CRITICAL for cross-device sync
class ReadingProgressRepository {
    private let offlineService = OfflineService()
    private let syncService = SyncService.shared
    
    // Get reading progress - Offline-first
    func getReadingProgress(userId: String, storyId: String, chapterId: String?) -> AnyPublisher<ReadingProgress?, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant)
                let progress = try self.offlineService.getReadingProgress(userId: userId, storyId: storyId, chapterId: chapterId)
                promise(.success(progress))
                
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
    
    // Update reading progress - Save locally first, sync in background
    func updateReadingProgress(_ progress: ReadingProgress) -> AnyPublisher<ReadingProgress, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            var updatedProgress = progress
            updatedProgress = ReadingProgress(
                id: progress.id,
                userId: progress.userId,
                storyId: progress.storyId,
                chapterId: progress.chapterId,
                position: progress.position,
                completedAt: progress.completedAt,
                syncedAt: nil, // Will be set after sync
                syncStatus: .pending
            )
            
            do {
                // Save to Core Data immediately
                try self.offlineService.saveReadingProgress(updatedProgress)
                promise(.success(updatedProgress))
                
                // Sync to backend in background
                Task {
                    try? await self.syncService.syncAll(userId: progress.userId)
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

