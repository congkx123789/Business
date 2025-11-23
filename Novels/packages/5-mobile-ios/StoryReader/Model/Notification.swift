import Foundation

// Notification model
struct Notification: Codable, Identifiable {
    let id: String
    let userId: String
    let type: NotificationType
    let title: String
    let body: String
    let data: [String: String]? // Additional data
    let isRead: Bool
    let readAt: Date?
    let createdAt: Date
    
    enum NotificationType: String, Codable {
        case comment
        case reply
        case like
        case follow
        case purchase
        case subscription
        case system
        case tip
        case vote
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case type
        case title
        case body
        case data
        case isRead = "is_read"
        case readAt = "read_at"
        case createdAt = "created_at"
    }
}

// Notification Settings model
struct NotificationSettings: Codable {
    let pushEnabled: Bool
    let emailEnabled: Bool
    let communityAlerts: Bool
    let monetizationAlerts: Bool
    
    enum CodingKeys: String, CodingKey {
        case pushEnabled = "push_enabled"
        case emailEnabled = "email_enabled"
        case communityAlerts = "community_alerts"
        case monetizationAlerts = "monetization_alerts"
    }
}

