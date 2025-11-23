import Foundation
import Combine

// Wallet Repository - Virtual Currency & Payments
class WalletRepository {
    private let graphQLService = GraphQLService.shared
    private let webSocketService = WebSocketService.shared
    
    // Get wallet balance - Real-time updates via WebSocket
    func getWalletBalance() -> AnyPublisher<Wallet, Error> {
        return graphQLService.getWalletBalance()
    }
    
    // Top up wallet
    func topUpWallet(amount: Int, paymentMethod: String) -> AnyPublisher<Transaction, Error> {
        return graphQLService.topUpWallet(amount: amount, paymentMethod: paymentMethod)
    }
    
    // Purchase chapter
    func purchaseChapter(chapterId: String) -> AnyPublisher<Transaction, Error> {
        return graphQLService.purchaseChapter(chapterId: chapterId)
    }
    
    // Subscribe to wallet balance updates
    func subscribeToBalanceUpdates(userId: String, onUpdate: @escaping (Wallet) -> Void) {
        webSocketService.subscribe("wallet:\(userId)") { event in
            // Parse event data and update wallet
            // onUpdate(parsedWallet)
        }
    }
}

