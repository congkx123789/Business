import Foundation
import Combine

// Selection State Manager - Manages selection state
class SelectionStateManager: ObservableObject {
    @Published var selectedItems: Set<String> = []
    @Published var isSelectionMode: Bool = false
    
    func toggleSelection(itemId: String) {
        if selectedItems.contains(itemId) {
            selectedItems.remove(itemId)
        } else {
            selectedItems.insert(itemId)
        }
        
        // Auto-exit selection mode if nothing selected
        if selectedItems.isEmpty {
            isSelectionMode = false
        }
    }
    
    func selectAll(itemIds: [String]) {
        selectedItems = Set(itemIds)
    }
    
    func clearSelection() {
        selectedItems.removeAll()
        isSelectionMode = false
    }
    
    func enterSelectionMode() {
        isSelectionMode = true
    }
    
    func exitSelectionMode() {
        isSelectionMode = false
        selectedItems.removeAll()
    }
}


