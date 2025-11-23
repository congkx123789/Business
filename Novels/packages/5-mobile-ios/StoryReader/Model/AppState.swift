import Foundation
import Combine

// App State - Global application state
final class AppState: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var currentUserId: String?
    
    private let authService = AuthService.shared
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Sync with AuthService
        authService.$isAuthenticated
            .assign(to: &$isAuthenticated)
        
        authService.$currentUserId
            .assign(to: &$currentUserId)
    }
    
    func getCurrentUserId() -> String {
        return authService.getCurrentUserId()
    }
}

