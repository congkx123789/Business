import Foundation
import Combine
import SwiftUI

// Storefront ViewModel - Discovery & Rankings
class StorefrontViewModel: ObservableObject {
    @Published var editorPicks: [Story] = []
    @Published var trendingStories: [Story] = []
    @Published var newReleases: [Story] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let discoveryRepository = DiscoveryRepository()
    private var cancellables = Set<AnyCancellable>()
    private var pendingRequests: Set<PendingRequest> = []
    
    func loadStorefront() {
        isLoading = true
        errorMessage = nil
        pendingRequests = PendingRequest.allCases.reduce(into: []) { $0.insert($1) }
        
        fetchEditorPicks()
        fetchTrending()
        fetchNewReleases()
    }
    
    private func fetchEditorPicks() {
        discoveryRepository.getEditorPicks(limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.handleCompletion(.editorPicks, completion: completion)
                },
                receiveValue: { [weak self] stories in
                    self?.editorPicks = stories
                }
            )
            .store(in: &cancellables)
    }
    
    private func fetchTrending() {
        discoveryRepository
            .getRankings(rankingType: .popularity, timeRange: .weekly)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.handleCompletion(.trending, completion: completion)
                },
                receiveValue: { [weak self] stories in
                    self?.trendingStories = stories
                }
            )
            .store(in: &cancellables)
    }
    
    private func fetchNewReleases() {
        discoveryRepository
            .getGenreStories(genre: nil, page: 1, limit: 10)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.handleCompletion(.newReleases, completion: completion)
                },
                receiveValue: { [weak self] stories in
                    self?.newReleases = stories
                }
            )
            .store(in: &cancellables)
    }
    
    private func handleCompletion(_ request: PendingRequest, completion: Subscribers.Completion<Error>) {
        if case .failure(let error) = completion {
            errorMessage = error.localizedDescription
        }
        
        pendingRequests.remove(request)
        if pendingRequests.isEmpty {
            isLoading = false
        }
    }
    
    private enum PendingRequest: CaseIterable, Hashable {
        case editorPicks
        case trending
        case newReleases
    }
}

