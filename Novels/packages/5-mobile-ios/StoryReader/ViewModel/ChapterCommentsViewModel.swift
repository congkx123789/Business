import Foundation
import Combine

// Chapter Comments ViewModel - orchestrates chapter-end discussion UI
class ChapterCommentsViewModel: ObservableObject {
    @Published var comments: [ChapterComment] = []
    @Published var sort: ChapterCommentSort = .mostLiked
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = ChapterCommentsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadComments(chapterId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getChapterComments(chapterId: chapterId, sort: sort)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] comments in
                    self?.comments = comments
                }
            )
            .store(in: &cancellables)
    }
    
    func createComment(storyId: String, chapterId: String, content: String) {
        let input = ChapterCommentInput(
            chapterId: chapterId,
            storyId: storyId,
            content: content
        )
        
        repository.createComment(input: input)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] comment in
                    self?.comments.insert(comment, at: 0)
                }
            )
            .store(in: &cancellables)
    }
    
    func reply(commentId: String, chapterId: String, content: String) {
        let input = ChapterCommentReplyInput(
            chapterId: chapterId,
            commentId: commentId,
            content: content
        )
        
        repository.replyToComment(input: input)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] updatedComment in
                    self?.replaceComment(updatedComment)
                }
            )
            .store(in: &cancellables)
    }
    
    func vote(commentId: String, vote: ChapterCommentVote) {
        repository.voteComment(commentId: commentId, vote: vote)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] result in
                    guard let index = self?.comments.firstIndex(where: { $0.id == result.commentId }) else { return }
                    var comment = self?.comments[index]
                    comment?.likes = result.likes
                    comment?.dislikes = result.dislikes
                    if let updated = comment {
                        self?.comments[index] = updated
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func changeSort(chapterId: String, newSort: ChapterCommentSort) {
        sort = newSort
        loadComments(chapterId: chapterId)
    }
    
    private func replaceComment(_ updatedComment: ChapterComment) {
        if let index = comments.firstIndex(where: { $0.id == updatedComment.id }) {
            comments[index] = updatedComment
        } else {
            comments.insert(updatedComment, at: 0)
        }
    }
}


