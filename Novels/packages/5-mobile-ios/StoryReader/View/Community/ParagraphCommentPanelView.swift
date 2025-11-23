import SwiftUI

// Paragraph Comment Panel - Shows all comments for a paragraph
struct ParagraphCommentPanelView: View {
    @ObservedObject var viewModel: ParagraphCommentsViewModel
    let chapterId: String
    let paragraphIndex: Int
    @Binding var isPresented: Bool
    
    @State private var newComment: String = ""
    @State private var selectedReaction: ReactionType?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Comment list
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 12) {
                        ForEach(viewModel.getComments(for: paragraphIndex)) { comment in
                            ParagraphCommentRow(comment: comment) {
                                viewModel.likeComment(commentId: comment.id, paragraphIndex: paragraphIndex)
                            }
                        }
                    }
                    .padding()
                }
                
                // Quick reactions
                VStack(spacing: 8) {
                    Text("Quick Reactions")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 12) {
                        ForEach([ReactionType.like, .laugh, .cry, .angry, .wow, .love], id: \.self) { reaction in
                            Button(action: {
                                selectedReaction = reaction
                                viewModel.createComment(
                                    chapterId: chapterId,
                                    paragraphIndex: paragraphIndex,
                                    content: "",
                                    reactionType: reaction
                                )
                            }) {
                                Text(reactionEmoji(reaction))
                                    .font(.title2)
                                    .frame(width: 44, height: 44)
                                    .background(
                                        selectedReaction == reaction ? Color.blue.opacity(0.2) : Color.gray.opacity(0.1)
                                    )
                                    .cornerRadius(8)
                            }
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                
                // Comment input
                HStack(spacing: 12) {
                    TextField("Add a comment...", text: $newComment)
                        .textFieldStyle(.roundedBorder)
                    
                    Button(action: {
                        viewModel.createComment(
                            chapterId: chapterId,
                            paragraphIndex: paragraphIndex,
                            content: newComment,
                            reactionType: nil
                        )
                        newComment = ""
                    }) {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title2)
                            .foregroundColor(newComment.isEmpty ? .gray : .blue)
                    }
                    .disabled(newComment.isEmpty)
                }
                .padding()
                .background(Color(.systemBackground))
            }
            .navigationTitle("Paragraph Comments")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        isPresented = false
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadParagraphComments(chapterId: chapterId, paragraphIndex: paragraphIndex)
        }
    }
    
    private func reactionEmoji(_ reaction: ReactionType) -> String {
        switch reaction {
        case .like: return "👍"
        case .laugh: return "😂"
        case .cry: return "😭"
        case .angry: return "😡"
        case .wow: return "😮"
        case .love: return "❤️"
        }
    }
}

struct ParagraphCommentRow: View {
    let comment: ParagraphComment
    let onLike: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                if let avatarUrl = comment.author.avatarUrl {
                    AsyncImage(url: URL(string: avatarUrl)) { image in
                        image.resizable()
                    } placeholder: {
                        Circle().fill(Color.gray.opacity(0.3))
                    }
                    .frame(width: 32, height: 32)
                    .clipShape(Circle())
                }
                
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text(comment.author.username)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        if comment.isAuthor {
                            Text("Author")
                                .font(.caption2)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(Color.blue.opacity(0.2))
                                .foregroundColor(.blue)
                                .cornerRadius(4)
                        }
                    }
                    
                    Text(comment.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
            }
            
            if let reaction = comment.reactionType {
                HStack {
                    Text(reactionEmoji(reaction))
                    Text(reaction.rawValue.capitalized)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            if !comment.content.isEmpty {
                Text(comment.content)
                    .font(.body)
            }
            
            HStack {
                Button(action: onLike) {
                    HStack(spacing: 4) {
                        Image(systemName: "hand.thumbsup")
                        Text("\(comment.likes)")
                    }
                    .font(.caption)
                    .foregroundColor(.secondary)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private func reactionEmoji(_ reaction: ReactionType) -> String {
        switch reaction {
        case .like: return "👍"
        case .laugh: return "😂"
        case .cry: return "😭"
        case .angry: return "😡"
        case .wow: return "😮"
        case .love: return "❤️"
        }
    }
}

