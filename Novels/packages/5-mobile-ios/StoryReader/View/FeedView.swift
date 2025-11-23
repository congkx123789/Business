import SwiftUI

// Feed View - Social feed showing community activity
struct FeedView: View {
    @StateObject private var viewModel = FeedViewModel()
    
    let userId: String
    
    @State private var isRefreshing = false
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.feedItems.isEmpty {
                    ProgressView("Loading feed...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.feedItems.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("Your feed is quiet")
                            .font(.headline)
                        Text("Follow authors, join book clubs, and add friends to see their activity here.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    List {
                        ForEach(viewModel.feedItems) { item in
                            FeedCard(item: item)
                                .onAppear {
                                    if item == viewModel.feedItems.last {
                                        viewModel.loadMore(userId: userId)
                                    }
                                }
                        }
                        
                        if viewModel.isLoading && !viewModel.feedItems.isEmpty {
                            ProgressView()
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        await refresh()
                    }
                }
            }
            .navigationTitle("Community Feed")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task { await refresh() }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(viewModel.isLoading)
                }
            }
            .task {
                if viewModel.feedItems.isEmpty {
                    viewModel.loadFeed(userId: userId)
                }
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                if let error = viewModel.errorMessage {
                    Text(error)
                }
            }
        }
    }
    
    private func refresh() async {
        guard !isRefreshing else { return }
        isRefreshing = true
        viewModel.refresh(userId: userId)
        try? await Task.sleep(nanoseconds: 300_000_000)
        isRefreshing = false
    }
}

// MARK: - Feed Card

private struct FeedCard: View {
    let item: FeedViewModel.FeedItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Label(item.type.title, systemImage: item.type.icon)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                Spacer()
                Text(item.timestamp, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(summaryText(for: item))
                .font(.body)
            
            if let metadata = metadataText(for: item) {
                Text(metadata)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 8)
    }
    
    private func summaryText(for item: FeedViewModel.FeedItem) -> String {
        switch item.type {
        case .post:
            return "New community post"
        case .groupActivity:
            return "Group activity update"
        case .readingChallenge:
            return "Reading challenge progress"
        case .friendActivity:
            return "Friend finished a chapter"
        }
    }
    
    private func metadataText(for item: FeedViewModel.FeedItem) -> String? {
        switch item.type {
        case .post:
            return "Tap to view post"
        case .groupActivity:
            return "See updates in your book clubs"
        case .readingChallenge:
            return "Keep your streaks alive"
        case .friendActivity:
            return "Send quick encouragement"
        }
    }
}

private extension FeedViewModel.FeedItemType {
    var title: String {
        switch self {
        case .post: return "Post"
        case .groupActivity: return "Group"
        case .readingChallenge: return "Challenge"
        case .friendActivity: return "Friend"
        }
    }
    
    var icon: String {
        switch self {
        case .post: return "text.bubble"
        case .groupActivity: return "person.3"
        case .readingChallenge: return "flame"
        case .friendActivity: return "figure.walk.motion"
        }
    }
}



