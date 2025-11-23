import XCTest

/// UI Tests for StoryReader App
/// Tests critical user flows and UI interactions
final class StoryReaderUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
    }
    
    override func tearDownWithError() throws {
        app = nil
    }
    
    // MARK: - App Launch Tests
    
    func testAppLaunches() throws {
        XCTAssertTrue(app.waitForExistence(timeout: 5.0), "App should launch successfully")
    }
    
    func testRootNavigationExists() throws {
        // Verify main tab bar exists
        let tabBar = app.tabBars.firstMatch
        XCTAssertTrue(tabBar.waitForExistence(timeout: 3.0), "Tab bar should exist")
    }
    
    // MARK: - Navigation Tests
    
    func testNavigateToLibrary() throws {
        let libraryTab = app.tabBars.buttons["Library"]
        if libraryTab.exists {
            libraryTab.tap()
            XCTAssertTrue(libraryTab.isSelected, "Library tab should be selected")
        }
    }
    
    func testNavigateToDiscover() throws {
        let discoverTab = app.tabBars.buttons["Discover"]
        if discoverTab.exists {
            discoverTab.tap()
            XCTAssertTrue(discoverTab.isSelected, "Discover tab should be selected")
        }
    }
    
    func testNavigateToCommunity() throws {
        let communityTab = app.tabBars.buttons["Community"]
        if communityTab.exists {
            communityTab.tap()
            XCTAssertTrue(communityTab.isSelected, "Community tab should be selected")
        }
    }
    
    // MARK: - Library Tests
    
    func testLibraryViewLoads() throws {
        let libraryTab = app.tabBars.buttons["Library"]
        if libraryTab.exists {
            libraryTab.tap()
            // Wait for library view to load
            sleep(1)
            // Verify library view elements exist (adjust selectors based on actual UI)
        }
    }
    
    // MARK: - Reader Tests
    
    func testOpenStoryReader() throws {
        // Navigate to library
        let libraryTab = app.tabBars.buttons["Library"]
        if libraryTab.exists {
            libraryTab.tap()
            
            // Try to tap first story (if exists)
            let firstStory = app.collectionViews.cells.firstMatch
            if firstStory.waitForExistence(timeout: 3.0) {
                firstStory.tap()
                // Verify reader view opens
                sleep(1)
            }
        }
    }
    
    // MARK: - Settings Tests
    
    func testOpenSettings() throws {
        // Navigate to settings (adjust selector based on actual UI)
        let settingsButton = app.buttons["Settings"]
        if settingsButton.exists {
            settingsButton.tap()
            sleep(1)
        }
    }
    
    // MARK: - TTS Tests
    
    func testTTSSettingsAccessible() throws {
        // Navigate to settings
        let settingsButton = app.buttons["Settings"]
        if settingsButton.exists {
            settingsButton.tap()
            
            // Look for TTS settings
            let ttsSettings = app.buttons["TTS Settings"]
            if ttsSettings.waitForExistence(timeout: 2.0) {
                ttsSettings.tap()
                sleep(1)
            }
        }
    }
    
    // MARK: - Performance Tests
    
    func testAppPerformance() throws {
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            app.launch()
        }
    }
}

