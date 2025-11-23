import Foundation
import Combine
import SwiftUI

// Fan Rankings ViewModel - Fan rankings list
class FanRankingsViewModel: ObservableObject {
    @Published var rankings: [FanRanking] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = FanRankingsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadRankings(storyId: String?, authorId: String?) {
        isLoading = true
        errorMessage = nil
        
        repository.getFanRankings(storyId: storyId, authorId: authorId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] rankings in
                    self?.rankings = rankings
                }
            )
            .store(in: &cancellables)
    }
}
