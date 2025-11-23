import Foundation
import Combine
import SwiftUI

// Feed ViewModel - Social feed
class FeedViewModel: ObservableObject {
    @Published var feedItems: [FeedItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var hasMore: Bool = true
    @Published var currentPage: Int = 0
    
    private let repository = FeedRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct FeedItem: Identifiable {
        let id: String
        let type: FeedItemType
        let timestamp: Date
        let data: Any // Post, Group, ReadingChallenge, etc.
    }
    
    enum FeedItemType {
        case post
        case groupActivity
        case readingChallenge
        case friendActivity
    }
    
    func loadFeed(userId: String, page: Int = 0) {
        isLoading = true
        errorMessage = nil
        
        repository.getFeed(userId: userId, page: page)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] items in
                    if page == 0 {
                        self?.feedItems = items
                    } else {
                        self?.feedItems.append(contentsOf: items)
                    }
                    self?.hasMore = items.count >= 20 // Assuming 20 items per page
                    self?.currentPage = page
                }
            )
            .store(in: &cancellables)
    }
    
    func loadMore(userId: String) {
        guard hasMore && !isLoading else { return }
        loadFeed(userId: userId, page: currentPage + 1)
    }
    
    func refresh(userId: String) {
        currentPage = 0
        feedItems = []
        loadFeed(userId: userId, page: 0)
    }
}


