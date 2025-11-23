import Foundation
import Combine
import SwiftUI

// Subscription ViewModel - Subscription management
class SubscriptionViewModel: ObservableObject {
    @Published var subscription: Subscription?
    @Published var plans: [MembershipPlan] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = SubscriptionRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadSubscription(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getSubscription(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] subscription in
                    self?.subscription = subscription
                }
            )
            .store(in: &cancellables)
    }
    
    func loadPlans() {
        isLoading = true
        errorMessage = nil
        
        repository.getPlans()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] plans in
                    self?.plans = plans
                }
            )
            .store(in: &cancellables)
    }
    
    func subscribe(userId: String, planId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.subscribe(userId: userId, planId: planId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newSubscription in
                    self?.subscription = newSubscription
                }
            )
            .store(in: &cancellables)
    }
    
    func cancelSubscription(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.cancelSubscription(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Reload subscription to get updated status
                        self?.loadSubscription(userId: userId)
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}


