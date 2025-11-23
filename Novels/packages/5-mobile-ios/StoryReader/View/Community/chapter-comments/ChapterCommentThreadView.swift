import SwiftUI

struct ChapterCommentThreadView: View {
    let comment: ChapterComment
    let onVote: (ChapterCommentVote) -> Void
    let onReply: (String) -> Void
    
    @State private var replyText: String = ""
    @State private var showReplyField: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            CommentHeader(author: comment.author, isAuthor: comment.isAuthor, createdAt: comment.createdAt)
            
            Text(comment.content)
                .font(.body)
            
            CommentVotingView(
                likes: comment.likes,
                dislikes: comment.dislikes,
                onUpvote: { onVote(.up) },
                onDownvote: { onVote(.down) }
            )
            
            if !comment.replies.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(comment.replies) { reply in
                        ChapterCommentReplyRow(reply: reply)
                    }
                }
                .padding(.leading, 16)
            }
            
            if showReplyField {
                HStack(spacing: 12) {
                    TextField("Reply...", text: $replyText)
                        .textFieldStyle(.roundedBorder)
                    
                    Button("Post") {
                        onReply(replyText)
                        replyText = ""
                        showReplyField = false
                    }
                    .disabled(replyText.isEmpty)
                }
            } else {
                Button("Reply") {
                    showReplyField = true
                }
                .font(.footnote)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

private struct CommentHeader: View {
    let author: CommentAuthor
    let isAuthor: Bool
    let createdAt: Date
    
    var body: some View {
        HStack {
            Text(author.username)
                .font(.subheadline)
                .fontWeight(.semibold)
            if isAuthor {
                Text("Author")
                    .font(.caption2)
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .background(Color.blue.opacity(0.15))
                    .foregroundColor(.blue)
                    .cornerRadius(4)
            }
            Spacer()
            Text(createdAt, style: .relative)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

private struct ChapterCommentReplyRow: View {
    let reply: ChapterCommentReply
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(reply.author.username)
                    .font(.footnote)
                    .fontWeight(.semibold)
                if reply.isAuthor {
                    Text("Author")
                        .font(.caption2)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 1)
                        .background(Color.blue.opacity(0.15))
                        .foregroundColor(.blue)
                        .cornerRadius(4)
                }
                Spacer()
                Text(reply.createdAt, style: .relative)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Text(reply.content)
                .font(.footnote)
        }
        .padding(10)
        .background(Color(.secondarySystemBackground))
        .cornerRadius(10)
    }
}


