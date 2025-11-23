import Foundation
import Combine
import SwiftUI

// Community ViewModel - Community interactions
class CommunityViewModel: ObservableObject {
    @Published var paragraphComments: [ParagraphComment] = []
    @Published var chapterComments: [ChapterComment] = []
    @Published var reviews: [Review] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let paragraphCommentsRepository = ParagraphCommentsRepository()
    private let chapterCommentsRepository = ChapterCommentsRepository()
    private let reviewsRepository = ReviewsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadParagraphComments(chapterId: String, paragraphIndex: Int? = nil) {
        isLoading = true
        errorMessage = nil
        
        paragraphCommentsRepository.getParagraphComments(chapterId: chapterId, paragraphIndex: paragraphIndex)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] comments in
                    self?.paragraphComments = comments
                }
            )
            .store(in: &cancellables)
    }
    
    func loadChapterComments(chapterId: String) {
        isLoading = true
        errorMessage = nil
        
        chapterCommentsRepository.getChapterComments(chapterId: chapterId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] comments in
                    self?.chapterComments = comments
                }
            )
            .store(in: &cancellables)
    }
    
    func loadReviews(storyId: String) {
        isLoading = true
        errorMessage = nil
        
        reviewsRepository.getReviews(storyId: storyId)
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
}


