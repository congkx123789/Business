import Foundation

// Wallet model - Virtual Currency
struct Wallet: Codable {
    let balance: Int // Points balance (1 point = 0.01 USD)
    let currency: String
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case balance, currency
        case updatedAt = "updated_at"
    }
}

// Transaction model
struct Transaction: Codable, Identifiable {
    let id: String
    let type: TransactionType
    let amount: Int
    let description: String?
    let createdAt: Date
    
    enum TransactionType: String, Codable {
        case topUp = "top_up"
        case purchase = "purchase"
        case refund = "refund"
    }
    
    enum CodingKeys: String, CodingKey {
        case id, type, amount, description
        case createdAt = "created_at"
    }
}

