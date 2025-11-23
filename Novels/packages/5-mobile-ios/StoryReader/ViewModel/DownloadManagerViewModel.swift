import Foundation
import Combine
import SwiftUI

// Download Manager ViewModel
class DownloadManagerViewModel: ObservableObject {
    @Published var downloadQueue: [DownloadManager.DownloadTask] = []
    @Published var activeDownloads: [String: DownloadManager.DownloadTask] = [:]
    @Published var completedDownloads: Set<String> = []
    @Published var storageUsage: Int64 = 0
    
    private let downloadManager = DownloadManager.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        observeDownloads()
        updateStorageUsage()
    }
    
    private func observeDownloads() {
        downloadManager.$downloadQueue
            .receive(on: DispatchQueue.main)
            .assign(to: &$downloadQueue)
        
        downloadManager.$activeDownloads
            .receive(on: DispatchQueue.main)
            .assign(to: &$activeDownloads)
        
        downloadManager.$completedDownloads
            .receive(on: DispatchQueue.main)
            .assign(to: &$completedDownloads)
    }
    
    func downloadChapter(storyId: String, chapterId: String, chapterTitle: String) {
        downloadManager.downloadChapter(storyId: storyId, chapterId: chapterId, chapterTitle: chapterTitle)
    }
    
    func cancelDownload(chapterId: String) {
        downloadManager.cancelDownload(chapterId: chapterId)
    }
    
    func deleteDownload(storyId: String, chapterId: String) {
        downloadManager.deleteDownload(storyId: storyId, chapterId: chapterId)
        updateStorageUsage()
    }
    
    func updateStorageUsage() {
        storageUsage = downloadManager.getStorageUsage()
    }
    
    func formatStorageSize(_ bytes: Int64) -> String {
        let formatter = ByteCountFormatter()
        formatter.allowedUnits = [.useMB, .useGB]
        formatter.countStyle = .file
        return formatter.string(fromByteCount: bytes)
    }
}

