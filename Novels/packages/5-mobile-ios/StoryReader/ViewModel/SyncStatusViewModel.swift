import Foundation
import Combine
import SwiftUI

// Sync Status ViewModel - Enhanced sync status tracking
class SyncStatusViewModel: ObservableObject {
    @Published var syncStatus: SyncService.SyncStatus = .idle
    @Published var lastSyncTime: Date?
    @Published var pendingOperations: Int = 0
    @Published var conflictCount: Int = 0
    @Published var isSyncing: Bool = false
    @Published var syncProgress: Double = 0.0
    @Published var errorMessage: String?
    
    private let syncService = SyncService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Observe sync status
        syncService.$syncStatus
            .receive(on: DispatchQueue.main)
            .assign(to: &$syncStatus)
        
        // Observe sync progress
        syncService.$syncProgress
            .receive(on: DispatchQueue.main)
            .assign(to: &$syncProgress)
        
        // Observe pending operations
        syncService.$pendingOperationsCount
            .receive(on: DispatchQueue.main)
            .assign(to: &$pendingOperations)
        
        // Observe conflicts
        syncService.$conflictCount
            .receive(on: DispatchQueue.main)
            .assign(to: &$conflictCount)
        
        // Update isSyncing based on status
        $syncStatus
            .map { status in
                status == .syncing
            }
            .assign(to: &$isSyncing)
    }
    
    func syncNow(userId: String) {
        Task {
            do {
                try await syncService.syncAll(userId: userId)
                await MainActor.run {
                    lastSyncTime = Date()
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Sync failed: \(error.localizedDescription)"
                }
            }
        }
    }
    
    func resolveConflicts(userId: String, strategy: ConflictResolutionStrategy) {
        Task {
            do {
                try await syncService.resolveConflicts(userId: userId, strategy: strategy)
            } catch {
                await MainActor.run {
                    errorMessage = "Conflict resolution failed: \(error.localizedDescription)"
                }
            }
        }
    }
    
    enum ConflictResolutionStrategy {
        case lastWriteWins
        case serverWins
        case clientWins
        case merge
    }
}


