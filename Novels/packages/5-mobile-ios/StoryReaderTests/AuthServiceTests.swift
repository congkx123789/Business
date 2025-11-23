import XCTest
import Combine
@testable import StoryReader

// Note: If module import fails, ensure StoryReader target is configured correctly
// Alternative: Remove @testable and import files directly if in same target

/// Unit tests for AuthService
@MainActor
final class AuthServiceTests: XCTestCase {
    var authService: AuthService!
    var cancellables: Set<AnyCancellable>!
    
    override func setUp() {
        super.setUp()
        // Clear UserDefaults for clean test
        UserDefaults.standard.removeObject(forKey: "current_user_id")
        authService = AuthService.shared
        cancellables = Set<AnyCancellable>()
    }
    
    override func tearDown() {
        // Clean up
        authService.logout()
        cancellables = nil
        authService = nil
        super.tearDown()
    }
    
    // MARK: - Initialization Tests
    
    func testSingletonInstance() {
        let instance1 = AuthService.shared
        let instance2 = AuthService.shared
        XCTAssertTrue(instance1 === instance2, "Should be singleton")
    }
    
    func testInitialState() {
        XCTAssertNil(authService.currentUserId)
        XCTAssertFalse(authService.isAuthenticated)
        XCTAssertFalse(authService.isLoading)
    }
    
    // MARK: - Login Tests
    
    func testLogin() {
        let testUserId = "test-user-123"
        
        authService.login(userId: testUserId)
        
        XCTAssertEqual(authService.currentUserId, testUserId)
        XCTAssertTrue(authService.isAuthenticated)
    }
    
    func testLoginPersistsToUserDefaults() {
        let testUserId = "test-user-456"
        
        authService.login(userId: testUserId)
        
        let savedUserId = UserDefaults.standard.string(forKey: "current_user_id")
        XCTAssertEqual(savedUserId, testUserId)
    }
    
    // MARK: - Logout Tests
    
    func testLogout() {
        authService.login(userId: "test-user")
        authService.logout()
        
        XCTAssertNil(authService.currentUserId)
        XCTAssertFalse(authService.isAuthenticated)
    }
    
    func testLogoutClearsUserDefaults() {
        authService.login(userId: "test-user")
        authService.logout()
        
        let savedUserId = UserDefaults.standard.string(forKey: "current_user_id")
        XCTAssertNil(savedUserId)
    }
    
    // MARK: - Get Current User ID Tests
    
    func testGetCurrentUserIdWhenAuthenticated() {
        let testUserId = "test-user-789"
        authService.login(userId: testUserId)
        
        let userId = authService.getCurrentUserId()
        XCTAssertEqual(userId, testUserId)
    }
    
    func testGetCurrentUserIdWhenNotAuthenticated() {
        let userId = authService.getCurrentUserId()
        XCTAssertEqual(userId, "current-user-id", "Should return fallback value")
    }
    
    // MARK: - Published Properties Tests
    
    func testPublishedPropertiesUpdate() {
        let loginExpectation = expectation(description: "Login updates published properties")
        let logoutExpectation = expectation(description: "Logout updates published properties")
        
        authService.$isAuthenticated
            .dropFirst()
            .sink { isAuthenticated in
                if isAuthenticated {
                    loginExpectation.fulfill()
                } else {
                    logoutExpectation.fulfill()
                }
            }
            .store(in: &cancellables)
        
        authService.login(userId: "test-user")
        authService.logout()
        
        waitForExpectations(timeout: 1.0)
    }
}

