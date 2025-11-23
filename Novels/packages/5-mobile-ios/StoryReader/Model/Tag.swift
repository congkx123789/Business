import Foundation

// Tag model - Supports hierarchical tags
struct Tag: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let color: String?
    let icon: String?
    let parentTagId: String?
    let parentTag: Tag?
    let childTags: [Tag]?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case name
        case color
        case icon
        case parentTagId = "parent_tag_id"
        case parentTag = "parent_tag"
        case childTags = "child_tags"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

