import SwiftUI

// Storefront View - Discovery & Featured Content
struct StorefrontView: View {
    @StateObject private var viewModel = StorefrontViewModel()
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if viewModel.isLoading &&
                        viewModel.editorPicks.isEmpty &&
                        viewModel.trendingStories.isEmpty &&
                        viewModel.newReleases.isEmpty {
                        ProgressView("Loading storefront...")
                            .frame(maxWidth: .infinity, minHeight: 160)
                    }
                    
                    if let error = viewModel.errorMessage {
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                            Text(error)
                                .font(.footnote)
                                .foregroundColor(.orange)
                            Spacer()
                        }
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(12)
                        .padding(.horizontal)
                    }
                    
                    // Editor's Picks
                    if !viewModel.editorPicks.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Editor's Picks")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 16) {
                                    ForEach(viewModel.editorPicks) { story in
                                        StoryCard(story: story)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                    
                    // New Releases
                    if !viewModel.newReleases.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("New Releases")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 16) {
                                    ForEach(viewModel.newReleases) { story in
                                        StoryCard(story: story)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                    
                    // Trending Stories
                    if !viewModel.trendingStories.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Trending Now")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 16) {
                                    ForEach(viewModel.trendingStories) { story in
                                        StoryCard(story: story)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Discover")
            .task {
                viewModel.loadStorefront()
            }
        }
    }
}

struct StoryCard: View {
    let story: Story
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Cover image
            Rectangle()
                .fill(Color.purple.opacity(0.2))
                .frame(width: 120, height: 160)
                .cornerRadius(8)
            
            // Title
            Text(story.title)
                .font(.subheadline)
                .fontWeight(.semibold)
                .lineLimit(2)
                .frame(width: 120, alignment: .leading)
            
            // Author
            Text(story.author)
                .font(.caption)
                .foregroundColor(.secondary)
                .lineLimit(1)
                .frame(width: 120, alignment: .leading)
        }
    }
}

