import Foundation

// FilteredView model - Dynamic query views
struct FilteredView: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let description: String?
    let query: FilterQuery
    let isAutoUpdating: Bool
    let displayOrder: Int
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case description
        case query
        case isAutoUpdating = "is_auto_updating"
        case displayOrder = "display_order"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

