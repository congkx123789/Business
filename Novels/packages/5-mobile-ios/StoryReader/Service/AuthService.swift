import Foundation
import Combine

// Authentication Service - Manages user authentication state
class AuthService: ObservableObject {
    static let shared = AuthService()
    
    @Published var currentUserId: String?
    @Published var isAuthenticated: Bool = false
    @Published var isLoading: Bool = false
    
    private let userDefaults = UserDefaults.standard
    private let userIdKey = "current_user_id"
    
    private init() {
        // Load saved user ID on init
        if let savedUserId = userDefaults.string(forKey: userIdKey) {
            currentUserId = savedUserId
            isAuthenticated = true
        }
    }
    
    // Login user (placeholder - will be replaced with actual auth implementation)
    func login(userId: String) {
        currentUserId = userId
        isAuthenticated = true
        userDefaults.set(userId, forKey: userIdKey)
    }
    
    // Logout user
    func logout() {
        currentUserId = nil
        isAuthenticated = false
        userDefaults.removeObject(forKey: userIdKey)
    }
    
    // Get current user ID (returns placeholder if not authenticated)
    func getCurrentUserId() -> String {
        return currentUserId ?? "current-user-id" // Fallback for development
    }
}

