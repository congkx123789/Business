import Foundation
import Combine

// Sync Manager - Main sync orchestrator (Cross-device sync)
class SyncManager: ObservableObject {
    static let shared = SyncManager()
    
    @Published var isSyncing: Bool = false
    @Published var syncProgress: Double = 0.0
    @Published var lastSyncTime: Date?
    @Published var syncErrors: [String] = []
    
    private let syncService = SyncService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Observe sync service status
        syncService.$syncStatus
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                switch status {
                case .syncing:
                    self?.isSyncing = true
                case .synced:
                    self?.isSyncing = false
                    self?.lastSyncTime = Date()
                    self?.syncProgress = 1.0
                case .error(let message):
                    self?.isSyncing = false
                    self?.syncErrors.append(message)
                default:
                    self?.isSyncing = false
                }
            }
            .store(in: &cancellables)
        
        syncService.$syncProgress
            .receive(on: DispatchQueue.main)
            .assign(to: &$syncProgress)
    }
    
    func syncAll(userId: String) async throws {
        try await syncService.syncAll(userId: userId)
    }
    
    func syncLibrary(userId: String) async throws {
        try await syncService.syncLibrary(userId: userId)
    }
    
    func syncReadingProgress(userId: String) async throws {
        try await syncService.syncReadingProgress(userId: userId)
    }
    
    func syncReadingPreferences(userId: String) async throws {
        try await syncService.syncReadingPreferences(userId: userId)
    }
    
    func syncBookmarks(userId: String) async throws {
        try await syncService.syncBookmarks(userId: userId)
    }
    
    func syncAnnotations(userId: String) async throws {
        try await syncService.syncAnnotations(userId: userId)
    }
    
    func syncBookshelves(userId: String) async throws {
        try await syncService.syncBookshelves(userId: userId)
    }
    
    func syncTags(userId: String) async throws {
        try await syncService.syncTags(userId: userId)
    }
    
    func syncFilteredViews(userId: String) async throws {
        try await syncService.syncFilteredViews(userId: userId)
    }
    
    func syncGroups(userId: String) async throws {
        try await syncService.syncGroups(userId: userId)
    }
}


