import SwiftUI

struct CommentVotingView: View {
    let likes: Int
    let dislikes: Int
    let onUpvote: () -> Void
    let onDownvote: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            Button(action: onUpvote) {
                Label("\(likes)", systemImage: "hand.thumbsup.fill")
                    .labelStyle(.titleAndIcon)
            }
            .buttonStyle(.bordered)
            
            Button(action: onDownvote) {
                Label("\(dislikes)", systemImage: "hand.thumbsdown.fill")
                    .labelStyle(.titleAndIcon)
            }
            .buttonStyle(.bordered)
            
            Spacer()
        }
        .font(.caption)
        .foregroundColor(.secondary)
    }
}


