import Foundation

// Bookshelf model - Enhanced with items support
struct Bookshelf: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let description: String?
    let color: String?
    let icon: String?
    let displayOrder: Int
    let isDefault: Bool
    let items: [BookshelfItem]?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case description
        case color
        case icon
        case displayOrder = "display_order"
        case isDefault = "is_default"
        case items
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// BookshelfItem model
struct BookshelfItem: Codable, Identifiable {
    let id: String
    let bookshelfId: String
    let libraryId: String
    let library: LibraryItem?
    let displayOrder: Int
    let addedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case bookshelfId = "bookshelf_id"
        case libraryId = "library_id"
        case library
        case displayOrder = "display_order"
        case addedAt = "added_at"
    }
}

