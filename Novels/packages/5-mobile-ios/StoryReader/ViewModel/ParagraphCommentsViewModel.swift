import Foundation
import Combine
import SwiftUI

// Paragraph Comments ViewModel - Duanping feature
class ParagraphCommentsViewModel: ObservableObject {
    @Published var comments: [Int: [ParagraphComment]] = [:] // paragraphIndex -> comments
    @Published var commentCounts: [Int: Int] = [:] // paragraphIndex -> count
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = ParagraphCommentsRepository()
    private var cancellables = Set<AnyCancellable>()
    private var chapterId: String?
    
    // Load comments for a chapter
    func loadComments(chapterId: String) {
        self.chapterId = chapterId
        isLoading = true
        errorMessage = nil
        
        // Load comment counts first
        repository.getParagraphCommentCounts(chapterId: chapterId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] counts in
                    self?.commentCounts = counts
                }
            )
            .store(in: &cancellables)
        
        // Subscribe to real-time updates
        repository.subscribeToComments(chapterId: chapterId) { [weak self] updatedComments in
            DispatchQueue.main.async {
                self?.updateComments(updatedComments)
            }
        }
        
        isLoading = false
    }
    
    // Load comments for a specific paragraph
    func loadParagraphComments(chapterId: String, paragraphIndex: Int) {
        repository.getParagraphComments(chapterId: chapterId, paragraphIndex: paragraphIndex)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] comments in
                    self?.comments[paragraphIndex] = comments
                }
            )
            .store(in: &cancellables)
    }
    
    // Create comment
    func createComment(chapterId: String, paragraphIndex: Int, content: String, reactionType: ReactionType?) {
        repository.createParagraphComment(
            chapterId: chapterId,
            paragraphIndex: paragraphIndex,
            content: content,
            reactionType: reactionType
        )
        .receive(on: DispatchQueue.main)
        .sink(
            receiveCompletion: { [weak self] completion in
                if case .failure(let error) = completion {
                    self?.errorMessage = error.localizedDescription
                }
            },
            receiveValue: { [weak self] newComment in
                if self?.comments[paragraphIndex] == nil {
                    self?.comments[paragraphIndex] = []
                }
                self?.comments[paragraphIndex]?.append(newComment)
                self?.commentCounts[paragraphIndex] = (self?.commentCounts[paragraphIndex] ?? 0) + 1
            }
        )
        .store(in: &cancellables)
    }
    
    // Like comment
    func likeComment(commentId: String, paragraphIndex: Int) {
        repository.likeParagraphComment(commentId: commentId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    // Update comment likes count
                    if let index = self?.comments[paragraphIndex]?.firstIndex(where: { $0.id == commentId }) {
                        var updatedComment = self?.comments[paragraphIndex]?[index]
                        // updatedComment?.likes += 1
                        // self?.comments[paragraphIndex]?[index] = updatedComment
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    // Get comment count for paragraph
    func getCommentCount(for paragraphIndex: Int) -> Int {
        return commentCounts[paragraphIndex] ?? 0
    }
    
    // Get comments for paragraph
    func getComments(for paragraphIndex: Int) -> [ParagraphComment] {
        return comments[paragraphIndex] ?? []
    }
    
    private func updateComments(_ updatedComments: [ParagraphComment]) {
        // Group comments by paragraph index
        var grouped: [Int: [ParagraphComment]] = [:]
        for comment in updatedComments {
            if grouped[comment.paragraphIndex] == nil {
                grouped[comment.paragraphIndex] = []
            }
            grouped[comment.paragraphIndex]?.append(comment)
        }
        comments = grouped
    }
}

