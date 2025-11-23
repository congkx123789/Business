import Foundation
import Combine
import SwiftUI

// Rankings ViewModel
class RankingsViewModel: ObservableObject {
    @Published var rankings: [Story] = []
    @Published var selectedType: DiscoveryRepository.RankingType = .popularity
    @Published var selectedGenre: String?
    @Published var selectedTimeRange: DiscoveryRepository.TimeRange = .weekly
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let discoveryRepository = DiscoveryRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadRankings() {
        isLoading = true
        errorMessage = nil
        
        discoveryRepository.getRankings(
            rankingType: selectedType,
            genre: selectedGenre,
            timeRange: selectedTimeRange
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { [weak self] completion in
                self?.isLoading = false
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            },
            receiveValue: { [weak self] stories in
                self?.rankings = stories
            }
        )
        .store(in: &cancellables)
    }
}

