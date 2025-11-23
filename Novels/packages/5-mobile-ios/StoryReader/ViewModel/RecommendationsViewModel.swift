import Foundation
import Combine
import SwiftUI

// Recommendations ViewModel - AI-powered recommendations
class RecommendationsViewModel: ObservableObject {
    @Published var recommendations: [Story] = []
    @Published var similarStories: [Story] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let recommendationsRepository = RecommendationsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadRecommendations(userId: String) {
        isLoading = true
        errorMessage = nil
        
        recommendationsRepository.getRecommendations(userId: userId, limit: 20)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] stories in
                    self?.recommendations = stories
                }
            )
            .store(in: &cancellables)
    }
    
    func loadSimilarStories(storyId: String) {
        recommendationsRepository.getSimilarStories(storyId: storyId, limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] stories in
                    self?.similarStories = stories
                }
            )
            .store(in: &cancellables)
    }
    
    func trackView(storyId: String, userId: String) {
        recommendationsRepository.trackBehavior(userId: userId, storyId: storyId, action: .view)
    }
}

