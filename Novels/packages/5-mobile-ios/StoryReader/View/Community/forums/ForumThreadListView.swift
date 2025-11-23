import SwiftUI

struct ForumThreadListView: View {
    let threads: [ForumThread]
    let onReply: (String, String) -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            ForEach(threads) { thread in
                NavigationLink(destination: ForumThreadDetailView(thread: thread, onReply: onReply)) {
                    ForumThreadCardView(thread: thread)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

struct ForumThreadCardView: View {
    let thread: ForumThread
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(thread.title)
                    .font(.headline)
                if thread.isPinned {
                    Image(systemName: "pin.fill")
                        .foregroundColor(.orange)
                }
                if thread.isLocked {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.red)
                }
                Spacer()
            }
            
            Text(thread.category)
                .font(.caption)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.blue.opacity(0.15))
                .foregroundColor(.blue)
                .cornerRadius(4)
            
            HStack(spacing: 16) {
                Label("\(thread.repliesCount) replies", systemImage: "text.bubble")
                Label(thread.lastActivityAt, style: .relative)
            }
            .font(.caption)
            .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
}


