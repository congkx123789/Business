import Foundation
import Combine

// Download Repository - Download management
class DownloadRepository {
    private let offlineService = OfflineService()
    private let contentStorageService = ContentStorageService.shared
    private let graphQLService = GraphQLService.shared
    
    func downloadStory(userId: String, storyId: String, includePremium: Bool = false) -> AnyPublisher<DownloadProgress, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    // Start download via ContentStorageService
                    let progress = try await self.contentStorageService.downloadStory(userId: userId, storyId: storyId, includePremium: includePremium)
                    promise(.success(progress))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getDownloadQueue(userId: String) -> AnyPublisher<[DownloadItem], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                let queue = try self.contentStorageService.getDownloadQueue(userId: userId)
                promise(.success(queue))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getStorageUsage(userId: String) -> AnyPublisher<StorageUsage, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                let usage = try self.contentStorageService.getStorageUsage(userId: userId)
                promise(.success(usage))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    struct DownloadProgress {
        let storyId: String
        let progress: Double // 0.0 - 1.0
        let downloadedBytes: Int64
        let totalBytes: Int64
    }
    
    struct DownloadItem {
        let id: String
        let storyId: String
        let status: DownloadStatus
        let progress: Double
    }
    
    enum DownloadStatus {
        case pending
        case downloading
        case completed
        case failed
        case paused
    }
    
    struct StorageUsage {
        let totalBytes: Int64
        let usedBytes: Int64
        let percentage: Double
        let itemCount: Int
    }
}


