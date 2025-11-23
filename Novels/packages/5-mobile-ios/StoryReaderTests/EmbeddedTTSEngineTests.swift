import XCTest
@testable import StoryReader

// Note: If module import fails, ensure StoryReader target is configured correctly
// Alternative: Remove @testable and import files directly if in same target

/// Unit tests for EmbeddedTTSEngine
/// Tests placeholder behavior until SDK is integrated
@MainActor
final class EmbeddedTTSEngineTests: XCTestCase {
    var engine: EmbeddedTTSEngine!
    
    override func setUp() {
        super.setUp()
        engine = EmbeddedTTSEngine()
    }
    
    override func tearDown() {
        engine = nil
        super.tearDown()
    }
    
    // MARK: - Initialization Tests
    
    func testInitialization() {
        XCTAssertNotNil(engine)
        XCTAssertFalse(engine.isSpeaking)
        XCTAssertEqual(engine.currentProgress, 0.0)
    }
    
    // MARK: - Synthesis Tests
    
    func testSynthesizeThrowsWhenNotInitialized() async {
        do {
            _ = try await engine.synthesize(text: "Test", voice: nil, speed: 1.0)
            XCTFail("Should throw engineNotAvailable error")
        } catch TTSError.engineNotAvailable {
            // Expected error
            XCTAssertTrue(true)
        } catch {
            XCTFail("Unexpected error: \(error)")
        }
    }
    
    // MARK: - Speak Tests
    
    func testSpeakThrowsWhenNotInitialized() async {
        do {
            try await engine.speak(text: "Test", voice: nil, speed: 1.0)
            XCTFail("Should throw engineNotAvailable error")
        } catch TTSError.engineNotAvailable {
            // Expected error
            XCTAssertTrue(true)
        } catch {
            XCTFail("Unexpected error: \(error)")
        }
    }
    
    // MARK: - Control Tests
    
    func testStop() {
        engine.isSpeaking = true
        engine.currentProgress = 0.5
        
        engine.stop()
        
        XCTAssertFalse(engine.isSpeaking)
        XCTAssertEqual(engine.currentProgress, 0.0)
    }
    
    func testPause() {
        engine.isSpeaking = true
        engine.pause()
        // Pause doesn't change state in placeholder
        // When SDK is integrated, this should pause playback
    }
    
    func testResume() {
        engine.resume()
        // Resume doesn't change state in placeholder
        // When SDK is integrated, this should resume playback
    }
    
    // MARK: - Helper Method Tests
    
    func testGetAvailableVoices() {
        let voices = engine.getAvailableVoices()
        XCTAssertTrue(voices.isEmpty, "Should return empty array until SDK is integrated")
    }
    
    func testCheckLicenseStatus() {
        let isValid = engine.checkLicenseStatus()
        XCTAssertFalse(isValid, "Should return false until SDK is integrated")
    }
}

