import Foundation
import Combine
import SwiftUI

// Bulk Operations ViewModel - Multi-select & batch actions
class BulkOperationsViewModel: ObservableObject {
    @Published var selectedItems: Set<String> = []
    @Published var isSelectionMode: Bool = false
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = BulkOperationsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func toggleSelection(itemId: String) {
        if selectedItems.contains(itemId) {
            selectedItems.remove(itemId)
        } else {
            selectedItems.insert(itemId)
        }
    }
    
    func selectAll(itemIds: [String]) {
        selectedItems = Set(itemIds)
    }
    
    func clearSelection() {
        selectedItems.removeAll()
    }
    
    func deleteSelected(userId: String) {
        guard !selectedItems.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        repository.deleteBulk(userId: userId, itemIds: Array(selectedItems))
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        self?.selectedItems.removeAll()
                        self?.isSelectionMode = false
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func moveToBookshelf(userId: String, bookshelfId: String) {
        guard !selectedItems.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        repository.moveToBookshelf(userId: userId, bookshelfId: bookshelfId, itemIds: Array(selectedItems))
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        self?.selectedItems.removeAll()
                        self?.isSelectionMode = false
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func applyTags(userId: String, tagIds: [String]) {
        guard !selectedItems.isEmpty else { return }
        
        isLoading = true
        errorMessage = nil
        
        repository.applyTags(userId: userId, itemIds: Array(selectedItems), tagIds: tagIds)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        self?.selectedItems.removeAll()
                        self?.isSelectionMode = false
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}


