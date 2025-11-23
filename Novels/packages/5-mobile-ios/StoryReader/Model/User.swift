import Foundation

// User model
struct User: Codable, Identifiable {
    let id: String
    let email: String
    let username: String
    let profile: Profile?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case username
        case profile
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Profile model
struct Profile: Codable {
    let userId: String
    let displayName: String
    let avatar: String?
    let bio: String?
    let createdAt: Date
    let updatedAt: Date
    
    enum CodingKeys: String, CodingKey {
        case userId = "user_id"
        case displayName = "display_name"
        case avatar
        case bio
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

