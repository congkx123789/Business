import XCTest
import Combine
@testable import StoryReader

// Note: If module import fails, ensure StoryReader target is configured correctly
// Alternative: Remove @testable and import files directly if in same target

/// Unit tests for TextToSpeechManager
@MainActor
final class TextToSpeechManagerTests: XCTestCase {
    var manager: TextToSpeechManager!
    var cancellables: Set<AnyCancellable>!
    
    override func setUp() {
        super.setUp()
        manager = TextToSpeechManager.shared
        cancellables = Set<AnyCancellable>()
    }
    
    override func tearDown() {
        cancellables = nil
        manager = nil
        super.tearDown()
    }
    
    // MARK: - Initialization Tests
    
    func testSingletonInstance() {
        let instance1 = TextToSpeechManager.shared
        let instance2 = TextToSpeechManager.shared
        XCTAssertTrue(instance1 === instance2, "Should be singleton")
    }
    
    func testDefaultValues() {
        XCTAssertFalse(manager.isSpeaking)
        XCTAssertEqual(manager.currentProgress, 0.0)
        XCTAssertEqual(manager.selectedEngine, .native)
        XCTAssertNil(manager.selectedVoice)
        XCTAssertEqual(manager.speed, 1.0)
    }
    
    // MARK: - Engine Selection Tests
    
    func testEngineSelectionNative() {
        manager.selectedEngine = .native
        // Native engine should be available
        XCTAssertEqual(manager.selectedEngine, .native)
    }
    
    func testEngineSelectionEmbedded() {
        manager.selectedEngine = .embedded
        // Embedded engine may not be available until SDK is integrated
        XCTAssertEqual(manager.selectedEngine, .embedded)
    }
    
    // MARK: - Voice Tests
    
    func testGetAvailableVoices() {
        let voices = manager.getAvailableVoices()
        XCTAssertFalse(voices.isEmpty, "Should have at least some native voices")
    }
    
    // MARK: - Control Tests
    
    func testStop() {
        manager.isSpeaking = true
        manager.currentProgress = 0.5
        
        manager.stop()
        
        XCTAssertFalse(manager.isSpeaking)
        XCTAssertEqual(manager.currentProgress, 0.0)
    }
    
    func testPause() {
        manager.isSpeaking = true
        manager.pause()
        XCTAssertFalse(manager.isSpeaking)
    }
    
    func testResume() {
        manager.resume()
        XCTAssertTrue(manager.isSpeaking)
    }
    
    // MARK: - Published Properties Tests
    
    func testPublishedProperties() {
        let expectation = expectation(description: "Published properties update")
        
        manager.$isSpeaking
            .dropFirst()
            .sink { isSpeaking in
                XCTAssertFalse(isSpeaking)
                expectation.fulfill()
            }
            .store(in: &cancellables)
        
        manager.stop()
        
        waitForExpectations(timeout: 1.0)
    }
}

