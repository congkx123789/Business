import SwiftUI

struct ChapterCommentFormView: View {
    @Binding var commentText: String
    var onSubmit: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Share your thoughts")
                .font(.headline)
            
            TextEditor(text: $commentText)
                .frame(minHeight: 80, maxHeight: 120)
                .padding(8)
                .background(Color(.systemBackground))
                .cornerRadius(10)
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
            
            HStack {
                Spacer()
                Button(action: onSubmit) {
                    Label("Post Comment", systemImage: "paperplane.fill")
                        .font(.subheadline)
                }
                .buttonStyle(.borderedProminent)
                .disabled(commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }
}


