import SwiftUI

struct ChapterCommentsSectionView: View {
    let storyId: String
    let chapterId: String
    
    @StateObject private var viewModel = ChapterCommentsViewModel()
    @State private var newComment: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Chapter Discussion")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
                CommentSortSelectorView(
                    selectedSort: viewModel.sort,
                    onChange: { sort in
                        viewModel.changeSort(chapterId: chapterId, newSort: sort)
                    }
                )
            }
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if viewModel.isLoading && viewModel.comments.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
            } else if viewModel.comments.isEmpty {
                Text("Be the first to share your thoughts about this chapter.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            } else {
                VStack(spacing: 12) {
                    ForEach(viewModel.comments) { comment in
                        ChapterCommentThreadView(
                            comment: comment,
                            onVote: { vote in
                                viewModel.vote(commentId: comment.id, vote: vote)
                            },
                            onReply: { content in
                                viewModel.reply(commentId: comment.id, chapterId: chapterId, content: content)
                            }
                        )
                    }
                }
            }
            
            ChapterCommentFormView(
                commentText: $newComment,
                onSubmit: {
                    viewModel.createComment(
                        storyId: storyId,
                        chapterId: chapterId,
                        content: newComment
                    )
                    newComment = ""
                }
            )
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .padding(.horizontal)
        .onAppear {
            viewModel.loadComments(chapterId: chapterId)
        }
    }
}


