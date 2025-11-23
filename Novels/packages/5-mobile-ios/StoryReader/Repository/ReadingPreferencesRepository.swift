import Foundation
import Combine

// Reading Preferences Repository - CRITICAL for cross-device sync
class ReadingPreferencesRepository {
    private let offlineService = OfflineService()
    private let syncService = SyncService.shared
    
    // Get reading preferences - Offline-first
    func getReadingPreferences() -> AnyPublisher<ReadingPreferences, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant)
                let preferences = try self.offlineService.getReadingPreferences() ?? ReadingPreferences()
                promise(.success(preferences))
                
                // 2. Sync in background
                Task {
                    try? await self.syncService.syncAll(userId: AuthService.shared.getCurrentUserId())
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Update reading preferences - CRITICAL: Must sync across all devices
    func updateReadingPreferences(_ preferences: ReadingPreferences) -> AnyPublisher<ReadingPreferences, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            var updatedPrefs = preferences
            updatedPrefs.syncedAt = nil // Will be set after sync
            
            do {
                // Save to Core Data immediately (offline-first)
                try self.offlineService.saveReadingPreferences(updatedPrefs)
                promise(.success(updatedPrefs))
                
                // Sync to backend immediately (CRITICAL for cross-device sync)
                Task {
                    try? await self.syncService.syncAll(userId: AuthService.shared.getCurrentUserId())
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    enum RepositoryError: Error {
        case unknown
        case syncFailed
    }
}

