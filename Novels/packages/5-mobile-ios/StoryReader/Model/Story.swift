import Foundation

// Story model - Converted from 7-shared StoryDto
struct Story: Codable, Identifiable {
    let id: String
    let title: String
    let author: String
    let description: String?
    let coverImage: String?
    let genreId: Int?
    let genre: String?
    let status: String?
    let totalChapters: Int?
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id, title, author, description
        case coverImage = "cover_image"
        case genreId = "genre_id"
        case genre, status
        case totalChapters = "total_chapters"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

