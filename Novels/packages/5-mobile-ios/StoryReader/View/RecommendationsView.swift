import SwiftUI

// Recommendations View - AI-powered recommendations
struct RecommendationsView: View {
    @StateObject private var viewModel = RecommendationsViewModel()
    let userId: String
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    if viewModel.isLoading {
                        ProgressView("Loading recommendations...")
                            .frame(maxWidth: .infinity, minHeight: 200)
                    } else if viewModel.recommendations.isEmpty {
                        VStack(spacing: 16) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 48))
                                .foregroundColor(.secondary)
                            Text("No recommendations yet")
                                .font(.headline)
                                .foregroundColor(.secondary)
                            Text("Start reading to get personalized recommendations")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                        .padding()
                    } else {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("For You")
                                .font(.title2)
                                .fontWeight(.bold)
                                .padding(.horizontal)
                            
                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                ForEach(viewModel.recommendations) { story in
                                    StoryCard(story: story)
                                        .onAppear {
                                            viewModel.trackView(storyId: story.id, userId: userId)
                                        }
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Recommendations")
            .task {
                viewModel.loadRecommendations(userId: userId)
            }
        }
    }
}

