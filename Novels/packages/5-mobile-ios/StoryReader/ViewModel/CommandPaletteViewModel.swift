import Foundation
import Combine
import SwiftUI

// Command Palette ViewModel - Command palette (mobile-optimized)
class CommandPaletteViewModel: ObservableObject {
    @Published var isOpen: Bool = false
    @Published var searchQuery: String = ""
    @Published var searchResults: [CommandResult] = []
    @Published var isLoading: Bool = false
    
    private let repository = CommandPaletteRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct CommandResult: Identifiable {
        let id: String
        let type: ResultType
        let title: String
        let subtitle: String?
        let icon: String?
        let action: () -> Void
    }
    
    enum ResultType {
        case story
        case chapter
        case annotation
        case setting
        case action
    }
    
    func search(query: String) {
        searchQuery = query
        isLoading = true
        
        repository.search(query: query)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                },
                receiveValue: { [weak self] results in
                    self?.searchResults = results
                }
            )
            .store(in: &cancellables)
    }
    
    func open() {
        isOpen = true
        searchQuery = ""
        searchResults = []
    }
    
    func close() {
        isOpen = false
        searchQuery = ""
        searchResults = []
    }
    
    func executeCommand(_ result: CommandResult) {
        result.action()
        close()
    }
}


