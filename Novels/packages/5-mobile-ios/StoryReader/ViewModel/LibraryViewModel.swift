import Foundation
import Combine
import SwiftUI

// Library ViewModel - MVVM Pattern (Rule #5)
class LibraryViewModel: ObservableObject {
    @Published var libraryItems: [LibraryItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var syncStatus: SyncService.SyncStatus = .idle
    
    private let repository = LibraryRepository()
    private let syncService = SyncService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Observe sync status
        syncService.$syncStatus
            .receive(on: DispatchQueue.main)
            .assign(to: &$syncStatus)
    }
    
    func loadLibrary(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getLibrary(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] items in
                    self?.libraryItems = items
                }
            )
            .store(in: &cancellables)
    }
    
    func addToLibrary(storyId: String, userId: String) {
        repository.addToLibrary(storyId: storyId, userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newItem in
                    self?.libraryItems.append(newItem)
                }
            )
            .store(in: &cancellables)
    }
    
    func syncNow(userId: String) {
        Task {
            do {
                try await syncService.syncAll(userId: userId)
                // Reload library after sync
                await MainActor.run {
                    loadLibrary(userId: userId)
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Sync failed: \(error.localizedDescription)"
                }
            }
        }
    }
}

