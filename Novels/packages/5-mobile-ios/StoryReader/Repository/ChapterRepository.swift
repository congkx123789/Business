import Foundation
import Combine

// Chapter Repository - Coordinates metadata (Core Data) + content (encrypted files)
class ChapterRepository {
    private let offlineService = OfflineService()
    private let contentStorageService = ContentStorageService.shared
    private let graphQLService = GraphQLService.shared
    
    // Get chapter - Offline-first: Load metadata from Core Data, content from encrypted file
    func getChapter(storyId: String, chapterId: String) -> AnyPublisher<Chapter, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            // 1. Load chapter metadata from Core Data (instant)
            var chapterMetadata: Chapter? = nil
            do {
                chapterMetadata = try self.offlineService.getChapterMetadata(chapterId: chapterId)
            } catch {
                // Metadata not found in Core Data, will fetch from network
                print("Chapter metadata not found in Core Data: \(error)")
            }
            
            // 2. Try to load content from encrypted file
            var content: String? = nil
            if self.contentStorageService.isChapterDownloaded(storyId: storyId, chapterId: chapterId) {
                do {
                    content = try self.contentStorageService.loadChapterContent(storyId: storyId, chapterId: chapterId)
                } catch {
                    print("Failed to load chapter content: \(error)")
                }
            }
            
            // 3. Create chapter object (use metadata if available, otherwise use defaults)
            let chapter = Chapter(
                id: chapterId,
                storyId: storyId,
                title: chapterMetadata?.title ?? "Chapter \(chapterId)",
                content: content,
                contentPath: self.contentStorageService.isChapterDownloaded(storyId: storyId, chapterId: chapterId) ? "downloaded" : nil,
                index: chapterMetadata?.index ?? 0,
                wordCount: chapterMetadata?.wordCount,
                isLocked: chapterMetadata?.isLocked ?? false,
                price: chapterMetadata?.price,
                createdAt: chapterMetadata?.createdAt,
                updatedAt: chapterMetadata?.updatedAt
            )
            
            promise(.success(chapter))
            
            // 4. If content not available, download in background
            if content == nil {
                Task {
                    // Download chapter content
                    // let downloadURL = try await self.graphQLService.getChapterDownloadURL(chapterId: chapterId)
                    // try await self.contentStorageService.downloadChapter(storyId: storyId, chapterId: chapterId, url: downloadURL)
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    // Download chapter for offline reading
    func downloadChapter(storyId: String, chapterId: String, url: URL) -> AnyPublisher<Double, Error> {
        return contentStorageService.downloadChapter(storyId: storyId, chapterId: chapterId, url: url)
    }
    
    enum RepositoryError: Error {
        case unknown
        case notFound
        case downloadFailed
    }
}

