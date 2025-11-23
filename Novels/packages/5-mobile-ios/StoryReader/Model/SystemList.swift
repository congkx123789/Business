import Foundation

// SystemList model - Predefined lists (Favorites, To Read, etc.)
struct SystemList: Codable, Identifiable {
    let id: String
    let userId: String
    let listType: SystemListType
    let libraryItems: [LibrarySystemListItem]?
    let createdAt: Date
    let updatedAt: Date
    
    enum SystemListType: String, Codable {
        case favorites
        case toRead = "to-read"
        case haveRead = "have-read"
        case currentlyReading = "currently-reading"
        case recentlyAdded = "recently-added"
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case listType = "list_type"
        case libraryItems = "library_items"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// LibrarySystemListItem model
struct LibrarySystemListItem: Codable, Identifiable {
    let id: String
    let libraryId: String
    let systemListId: String
    let createdAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case libraryId = "library_id"
        case systemListId = "system_list_id"
        case createdAt = "created_at"
    }
}

