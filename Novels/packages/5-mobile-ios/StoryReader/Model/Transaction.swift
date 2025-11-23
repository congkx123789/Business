import Foundation

// Transaction model - Currency transactions
struct Transaction: Codable, Identifiable {
    let id: String
    let walletId: String
    let userId: String
    let type: TransactionType
    let amount: Double
    let balanceBefore: Double
    let balanceAfter: Double
    let description: String?
    let referenceId: String? // Reference to purchase, mission, etc.
    let createdAt: Date
    
    enum TransactionType: String, Codable {
        case earn
        case spend
        case topUp = "top-up"
        case refund
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case walletId = "wallet_id"
        case userId = "user_id"
        case type
        case amount
        case balanceBefore = "balance_before"
        case balanceAfter = "balance_after"
        case description
        case referenceId = "reference_id"
        case createdAt = "created_at"
    }
}

