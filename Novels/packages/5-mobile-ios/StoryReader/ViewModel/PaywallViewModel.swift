import Foundation
import Combine
import SwiftUI

// Paywall ViewModel - Paywall & Purchase
class PaywallViewModel: ObservableObject {
    @Published var paywallInfo: PaywallInfo?
    @Published var isPurchasing: Bool = false
    @Published var purchaseError: String?
    @Published var purchaseSuccess: Bool = false
    
    private let repository = PaywallRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct PaywallInfo {
        let storyId: String
        let freeChapters: Int
        let paidChapters: [ChapterPrice]
        let userBalance: Double
    }
    
    struct ChapterPrice {
        let chapterId: String
        let chapterNumber: Int
        let price: Double
        let characterCount: Int
    }
    
    func loadPaywallInfo(storyId: String, userId: String) {
        repository.getPaywallInfo(storyId: storyId, userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.purchaseError = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] info in
                    self?.paywallInfo = info
                }
            )
            .store(in: &cancellables)
    }
    
    func purchaseChapter(chapterId: String, userId: String) {
        isPurchasing = true
        purchaseError = nil
        purchaseSuccess = false
        
        repository.purchaseChapter(chapterId: chapterId, userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isPurchasing = false
                    if case .failure(let error) = completion {
                        self?.purchaseError = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.purchaseSuccess = true
                    // Reload paywall info to update balance
                    if let storyId = self?.paywallInfo?.storyId {
                        self?.loadPaywallInfo(storyId: storyId, userId: userId)
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func purchaseBulk(chapterIds: [String], userId: String) {
        isPurchasing = true
        purchaseError = nil
        purchaseSuccess = false
        
        repository.purchaseBulk(chapterIds: chapterIds, userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isPurchasing = false
                    if case .failure(let error) = completion {
                        self?.purchaseError = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.purchaseSuccess = true
                }
            )
            .store(in: &cancellables)
    }
}


