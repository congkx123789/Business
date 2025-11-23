import Foundation
import Combine

class ReviewsViewModel: ObservableObject {
    @Published var reviews: [Review] = []
    @Published var sort: ReviewSort = .mostHelpful
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = ReviewsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadReviews(storyId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getReviews(storyId: storyId, sort: sort)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] reviews in
                    self?.reviews = reviews
                }
            )
            .store(in: &cancellables)
    }
    
    func postReview(input: ReviewInput) {
        repository.createReview(input)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] review in
                    self?.reviews.insert(review, at: 0)
                }
            )
            .store(in: &cancellables)
    }
    
    func voteHelpful(reviewId: String, helpful: Bool) {
        repository.voteReview(reviewId: reviewId, helpful: helpful)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] result in
                    guard let index = self?.reviews.firstIndex(where: { $0.id == result.reviewId }) else { return }
                    var review = self?.reviews[index]
                    review?.helpfulCount = result.helpfulCount
                    review?.notHelpfulCount = result.notHelpfulCount
                    if let updated = review {
                        self?.reviews[index] = updated
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func changeSort(storyId: String, newSort: ReviewSort) {
        sort = newSort
        loadReviews(storyId: storyId)
    }
}


