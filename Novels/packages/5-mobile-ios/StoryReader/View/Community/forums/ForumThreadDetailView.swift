import SwiftUI

struct ForumThreadDetailView: View {
    let thread: ForumThread
    let onReply: (String, String) -> Void
    
    @State private var replyText: String = ""
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                ForumThreadCardView(thread: thread)
                
                if let posts = thread.posts, !posts.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(posts) { post in
                            ForumPostThreadView(post: post)
                        }
                    }
                } else {
                    Text("No replies yet.")
                        .foregroundColor(.secondary)
                }
                
                ForumPostFormView(replyText: $replyText) {
                    onReply(thread.id, replyText)
                    replyText = ""
                }
                
                ForumModerationView(isLocked: thread.isLocked, isPinned: thread.isPinned)
            }
            .padding()
        }
        .navigationTitle(thread.title)
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ForumPostThreadView: View {
    let post: ForumPost
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(post.author.username)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                Spacer()
                Text(post.createdAt, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Text(post.content)
                .font(.body)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: Color.black.opacity(0.03), radius: 3, x: 0, y: 1)
    }
}

struct ForumPostFormView: View {
    @Binding var replyText: String
    let onSubmit: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Reply")
                .font(.headline)
            TextEditor(text: $replyText)
                .frame(minHeight: 80)
                .padding(8)
                .background(Color(.secondarySystemBackground))
                .cornerRadius(10)
            
            HStack {
                Spacer()
                Button("Send") {
                    onSubmit()
                }
                .disabled(replyText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
    }
}

struct ForumModerationView: View {
    let isLocked: Bool
    let isPinned: Bool
    
    var body: some View {
        HStack(spacing: 16) {
            if isPinned {
                Label("Pinned", systemImage: "pin.fill")
            }
            if isLocked {
                Label("Locked", systemImage: "lock.fill")
            }
        }
        .font(.caption)
        .foregroundColor(.secondary)
    }
}


