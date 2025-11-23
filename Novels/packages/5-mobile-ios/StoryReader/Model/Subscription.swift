import Foundation

// Subscription model - Membership/Subscription plans
struct Subscription: Codable, Identifiable {
    let id: String
    let userId: String
    let planId: String
    let plan: MembershipPlan?
    let status: SubscriptionStatus
    let startDate: Date
    let endDate: Date?
    let autoRenew: Bool
    let createdAt: Date
    let updatedAt: Date
    
    enum SubscriptionStatus: String, Codable {
        case active
        case cancelled
        case expired
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case planId = "plan_id"
        case plan
        case status
        case startDate = "start_date"
        case endDate = "end_date"
        case autoRenew = "auto_renew"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// MembershipPlan model
struct MembershipPlan: Codable, Identifiable {
    let id: String
    let name: String
    let price: Double // In real currency (CNY)
    let coinsGranted: Int // Immediate coin grant
    let dailyBonus: Int // Daily login bonus
    let billingPeriod: BillingPeriod
    let isActive: Bool
    let createdAt: Date
    let updatedAt: Date
    
    enum BillingPeriod: String, Codable {
        case monthly
        case yearly
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case price
        case coinsGranted = "coins_granted"
        case dailyBonus = "daily_bonus"
        case billingPeriod = "billing_period"
        case isActive = "is_active"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

