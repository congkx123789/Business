import SwiftUI

// Paragraph Comment Bubble - Shows comment count on paragraph
struct ParagraphCommentBubbleView: View {
    let commentCount: Int
    let onTap: () -> Void
    
    var body: some View {
        if commentCount > 0 {
            Button(action: onTap) {
                Text("\(commentCount)")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.blue.opacity(0.4), lineWidth: 1)
                    )
            }
        }
    }
}

