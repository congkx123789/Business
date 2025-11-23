import SwiftUI

struct ReviewsSectionView: View {
    let storyId: String
    
    @StateObject private var viewModel = ReviewsViewModel()
    @State private var showReviewForm = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Reviews & Ratings")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
                Menu {
                    ForEach(ReviewSort.allCases, id: \.self) { sort in
                        Button {
                            viewModel.changeSort(storyId: storyId, newSort: sort)
                        } label: {
                            HStack {
                                Text(label(for: sort))
                                if sort == viewModel.sort {
                                    Image(systemName: "checkmark")
                                }
                            }
                        }
                    }
                } label: {
                    Label(label(for: viewModel.sort), systemImage: "arrow.up.arrow.down")
                }
            }
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if viewModel.isLoading && viewModel.reviews.isEmpty {
                ProgressView()
                    .frame(maxWidth: .infinity)
            } else if viewModel.reviews.isEmpty {
                Text("No reviews yet. Be the first to share your thoughts!")
                    .foregroundColor(.secondary)
            } else {
                FeaturedReviewsView(reviews: viewModel.reviews)
                
                VStack(spacing: 12) {
                    ForEach(viewModel.reviews) { review in
                        ReviewCardView(
                            review: review,
                            onHelpful: { viewModel.voteHelpful(reviewId: review.id, helpful: true) },
                            onNotHelpful: { viewModel.voteHelpful(reviewId: review.id, helpful: false) }
                        )
                    }
                }
            }
            
            Button(action: { showReviewForm = true }) {
                Label("Write a review", systemImage: "square.and.pencil")
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear {
            viewModel.loadReviews(storyId: storyId)
        }
        .sheet(isPresented: $showReviewForm) {
            ReviewFormView(storyId: storyId) { input in
                viewModel.postReview(input: input)
            }
        }
    }
    
    private func label(for sort: ReviewSort) -> String {
        switch sort {
        case .mostHelpful: return "Most helpful"
        case .mostRecent: return "Most recent"
        case .highestRated: return "Highest rated"
        }
    }
}


