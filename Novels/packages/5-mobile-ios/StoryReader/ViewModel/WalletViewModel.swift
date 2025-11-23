import Foundation
import Combine
import SwiftUI

// Wallet ViewModel - Virtual Currency & Payments
class WalletViewModel: ObservableObject {
    @Published var wallet: Wallet?
    @Published var transactions: [Transaction] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = WalletRepository()
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        // Subscribe to real-time wallet updates
        repository.subscribeToBalanceUpdates(userId: AuthService.shared.getCurrentUserId()) { [weak self] updatedWallet in
            DispatchQueue.main.async {
                self?.wallet = updatedWallet
            }
        }
    }
    
    // Load wallet balance
    func loadWallet() {
        isLoading = true
        errorMessage = nil
        
        repository.getWalletBalance()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] wallet in
                    self?.wallet = wallet
                }
            )
            .store(in: &cancellables)
    }
    
    // Top up wallet
    func topUp(amount: Int, paymentMethod: String) {
        isLoading = true
        errorMessage = nil
        
        repository.topUpWallet(amount: amount, paymentMethod: paymentMethod)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Reload wallet after top-up
                        self?.loadWallet()
                    }
                },
                receiveValue: { [weak self] transaction in
                    self?.transactions.insert(transaction, at: 0)
                }
            )
            .store(in: &cancellables)
    }
    
    // Purchase chapter
    func purchaseChapter(chapterId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.purchaseChapter(chapterId: chapterId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Reload wallet after purchase
                        self?.loadWallet()
                    }
                },
                receiveValue: { [weak self] transaction in
                    self?.transactions.insert(transaction, at: 0)
                }
            )
            .store(in: &cancellables)
    }
}

