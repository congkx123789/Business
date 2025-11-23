import Foundation
import Combine

// Download Manager - Manages chapter downloads for offline reading
class DownloadManager: ObservableObject {
    static let shared = DownloadManager()
    
    @Published var downloadQueue: [DownloadTask] = []
    @Published var activeDownloads: [String: DownloadTask] = [:] // chapterId -> task
    @Published var completedDownloads: Set<String> = []
    
    private let contentStorageService = ContentStorageService.shared
    private let chapterRepository = ChapterRepository()
    
    struct DownloadTask: Identifiable {
        let id: String
        let storyId: String
        let chapterId: String
        let chapterTitle: String
        var progress: Double = 0.0
        var status: DownloadStatus = .pending
        
        enum DownloadStatus {
            case pending
            case downloading
            case completed
            case failed
            case cancelled
        }
    }
    
    // Add chapter to download queue
    func downloadChapter(storyId: String, chapterId: String, chapterTitle: String) {
        // Check if already downloaded
        if contentStorageService.isChapterDownloaded(storyId: storyId, chapterId: chapterId) {
            completedDownloads.insert(chapterId)
            return
        }
        
        // Check if already in queue
        if downloadQueue.contains(where: { $0.chapterId == chapterId }) {
            return
        }
        
        let task = DownloadTask(
            id: UUID().uuidString,
            storyId: storyId,
            chapterId: chapterId,
            chapterTitle: chapterTitle,
            status: .pending
        )
        
        downloadQueue.append(task)
        processQueue()
    }
    
    // Download multiple chapters
    func downloadChapters(storyId: String, chapters: [(id: String, title: String)]) {
        for chapter in chapters {
            downloadChapter(storyId: storyId, chapterId: chapter.id, chapterTitle: chapter.title)
        }
    }
    
    // Process download queue
    private func processQueue() {
        // Find next pending task
        guard let taskIndex = downloadQueue.firstIndex(where: { $0.status == .pending }),
              activeDownloads.count < 3 else { // Max 3 concurrent downloads
            return
        }
        
        var task = downloadQueue[taskIndex]
        task.status = .downloading
        downloadQueue[taskIndex] = task
        activeDownloads[task.chapterId] = task
        
        // Start download
        Task {
            do {
                // Get download URL
                // let url = try await chapterRepository.getChapterDownloadURL(chapterId: task.chapterId)
                
                // Download with progress tracking
                // let cancellable = contentStorageService.downloadChapter(
                //     storyId: task.storyId,
                //     chapterId: task.chapterId,
                //     url: url
                // )
                // .sink(
                //     receiveValue: { progress in
                //         DispatchQueue.main.async {
                //             self.updateProgress(chapterId: task.chapterId, progress: progress)
                //         }
                //     },
                //     receiveCompletion: { completion in
                //         DispatchQueue.main.async {
                //             if case .finished = completion {
                //                 self.completeDownload(chapterId: task.chapterId)
                //             } else {
                //                 self.failDownload(chapterId: task.chapterId)
                //             }
                //         }
                //     }
                // )
                
                // Placeholder
                await MainActor.run {
                    completeDownload(chapterId: task.chapterId)
                }
            } catch {
                await MainActor.run {
                    failDownload(chapterId: task.chapterId)
                }
            }
        }
        
        // Process next task
        processQueue()
    }
    
    private func updateProgress(chapterId: String, progress: Double) {
        if let index = downloadQueue.firstIndex(where: { $0.chapterId == chapterId }) {
            downloadQueue[index].progress = progress
        }
        activeDownloads[chapterId]?.progress = progress
    }
    
    private func completeDownload(chapterId: String) {
        if let index = downloadQueue.firstIndex(where: { $0.chapterId == chapterId }) {
            downloadQueue[index].status = .completed
            downloadQueue[index].progress = 1.0
        }
        activeDownloads.removeValue(forKey: chapterId)
        completedDownloads.insert(chapterId)
        processQueue()
    }
    
    private func failDownload(chapterId: String) {
        if let index = downloadQueue.firstIndex(where: { $0.chapterId == chapterId }) {
            downloadQueue[index].status = .failed
        }
        activeDownloads.removeValue(forKey: chapterId)
        processQueue()
    }
    
    // Cancel download
    func cancelDownload(chapterId: String) {
        if let index = downloadQueue.firstIndex(where: { $0.chapterId == chapterId }) {
            downloadQueue[index].status = .cancelled
        }
        activeDownloads.removeValue(forKey: chapterId)
        processQueue()
    }
    
    // Delete downloaded chapter
    func deleteDownload(storyId: String, chapterId: String) {
        try? contentStorageService.deleteChapter(storyId: storyId, chapterId: chapterId)
        completedDownloads.remove(chapterId)
    }
    
    // Get storage usage
    func getStorageUsage() -> Int64 {
        return FileStorageManager.shared.getStorageSize()
    }
}

