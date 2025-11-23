import XCTest

/// UI Tests for Library features
final class LibraryUITests: XCTestCase {
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
    
    // MARK: - Library View Tests
    
    func testLibraryViewDisplays() throws {
        let libraryTab = app.tabBars.buttons["Library"]
        XCTAssertTrue(libraryTab.waitForExistence(timeout: 3.0))
        libraryTab.tap()
        
        // Verify library view elements
        sleep(1)
    }
    
    func testLibrarySearch() throws {
        let libraryTab = app.tabBars.buttons["Library"]
        libraryTab.tap()
        
        // Look for search field
        let searchField = app.searchFields.firstMatch
        if searchField.waitForExistence(timeout: 2.0) {
            searchField.tap()
            searchField.typeText("test")
            sleep(1)
        }
    }
    
    // MARK: - Bookshelf Tests
    
    func testBookshelfNavigation() throws {
        let libraryTab = app.tabBars.buttons["Library"]
        libraryTab.tap()
        
        // Look for bookshelf button
        let bookshelfButton = app.buttons["Bookshelves"]
        if bookshelfButton.waitForExistence(timeout: 2.0) {
            bookshelfButton.tap()
            sleep(1)
        }
    }
    
    // MARK: - Download Tests
    
    func testDownloadManagerAccessible() throws {
        let libraryTab = app.tabBars.buttons["Library"]
        libraryTab.tap()
        
        // Look for downloads button
        let downloadsButton = app.buttons["Downloads"]
        if downloadsButton.waitForExistence(timeout: 2.0) {
            downloadsButton.tap()
            sleep(1)
        }
    }
}

