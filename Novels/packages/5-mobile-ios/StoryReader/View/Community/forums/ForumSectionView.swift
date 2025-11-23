import SwiftUI

struct ForumSectionView: View {
    let storyId: String
    @StateObject private var viewModel = ForumViewModel()
    @State private var showCreateThread = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Forums & Threads")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
                ForumCategorySelectorView(selectedCategory: viewModel.selectedCategory) { category in
                    viewModel.changeCategory(category)
                }
            }
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if viewModel.isLoading && viewModel.threads.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
            } else if viewModel.threads.isEmpty {
                Text("No threads yet. Start a conversation!")
                    .foregroundColor(.secondary)
            } else {
                ForumThreadListView(
                    threads: viewModel.threads,
                    onReply: { threadId, content in
                        viewModel.reply(to: threadId, content: content)
                    }
                )
            }
            
            Button(action: { showCreateThread = true }) {
                Label("Create Thread", systemImage: "plus.bubble")
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear {
            viewModel.loadThreads(storyId: storyId)
        }
        .sheet(isPresented: $showCreateThread) {
            ForumThreadFormView(storyId: storyId) { title, category, content in
                viewModel.createThread(storyId: storyId, title: title, category: category, content: content)
            }
        }
    }
}


