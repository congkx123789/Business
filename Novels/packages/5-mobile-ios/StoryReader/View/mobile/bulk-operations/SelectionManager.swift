import SwiftUI

// Selection Manager - Simple adapter to synchronize view selection state
final class SelectionManager: ObservableObject {
    @Published private(set) var selectedIds: Set<String> = []
    
    func toggle(id: String) {
        if selectedIds.contains(id) {
            selectedIds.remove(id)
        } else {
            selectedIds.insert(id)
        }
    }
    
    func clear() {
        selectedIds.removeAll()
    }
}


