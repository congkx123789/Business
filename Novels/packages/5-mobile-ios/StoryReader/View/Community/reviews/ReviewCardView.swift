import SwiftUI

struct ReviewCardView: View {
    let review: Review
    let onHelpful: () -> Void
    let onNotHelpful: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(review.author.username)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    Text(review.createdAt, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                Spacer()
                ReviewRatingsView(rating: review.rating)
            }
            
            if let title = review.title {
                Text(title)
                    .font(.headline)
            }
            
            Text(review.content)
                .font(.body)
            
            if let ratings = review.ratings {
                HStack(spacing: 12) {
                    if let plot = ratings.plot {
                        ratingChip(title: "Plot", value: plot)
                    }
                    if let characters = ratings.characters {
                        ratingChip(title: "Characters", value: characters)
                    }
                    if let pace = ratings.pacing {
                        ratingChip(title: "Pacing", value: pace)
                    }
                    if let writing = ratings.writingStyle {
                        ratingChip(title: "Writing", value: writing)
                    }
                }
            }
            
            ReviewHelpfulVotingView(
                helpfulCount: review.helpfulCount,
                notHelpfulCount: review.notHelpfulCount,
                onHelpful: onHelpful,
                onNotHelpful: onNotHelpful
            )
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.05), radius: 4, x: 0, y: 2)
    }
    
    private func ratingChip(title: String, value: Double) -> some View {
        HStack(spacing: 4) {
            Text(title)
            Text(String(format: "%.1f", value))
        }
        .font(.caption)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.blue.opacity(0.1))
        .cornerRadius(8)
    }
}


