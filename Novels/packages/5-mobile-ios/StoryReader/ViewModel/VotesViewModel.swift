import Foundation
import Combine
import SwiftUI

// Votes ViewModel - Monthly votes
class VotesViewModel: ObservableObject {
    @Published var availableVotes: Int = 0
    @Published var powerStones: Int = 0
    @Published var monthlyVotes: Int = 0
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var voteSuccess: Bool = false
    
    private let repository = VotesRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadVotes(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getUserVotes(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] votes in
                    self?.availableVotes = votes.total
                    self?.powerStones = votes.powerStones
                    self?.monthlyVotes = votes.monthlyVotes
                }
            )
            .store(in: &cancellables)
    }
    
    func castPowerStoneVote(storyId: String, userId: String, votes: Int) {
        isLoading = true
        errorMessage = nil
        voteSuccess = false
        
        repository.castPowerStoneVote(storyId: storyId, userId: userId, votes: votes)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.voteSuccess = true
                    // Reload votes to update balance
                    self?.loadVotes(userId: userId)
                }
            )
            .store(in: &cancellables)
    }
    
    func castMonthlyVote(storyId: String, userId: String, votes: Int) {
        isLoading = true
        errorMessage = nil
        voteSuccess = false
        
        repository.castMonthlyVote(storyId: storyId, userId: userId, votes: votes)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    self?.voteSuccess = true
                    // Reload votes to update balance
                    self?.loadVotes(userId: userId)
                }
            )
            .store(in: &cancellables)
    }
}
