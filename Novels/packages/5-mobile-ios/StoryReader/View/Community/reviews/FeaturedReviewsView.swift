import SwiftUI

struct FeaturedReviewsView: View {
    let reviews: [Review]
    
    var featured: [Review] {
        reviews.filter { $0.isFeatured }.prefix(3).map { $0 }
    }
    
    var body: some View {
        if !featured.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text("Featured Reviews")
                    .font(.headline)
                
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        ForEach(featured) { review in
                            VStack(alignment: .leading, spacing: 6) {
                                ReviewRatingsView(rating: review.rating)
                                Text(review.author.username)
                                    .font(.subheadline)
                                    .fontWeight(.semibold)
                                Text(review.content)
                                    .font(.footnote)
                                    .lineLimit(3)
                            }
                            .padding()
                            .frame(width: 200, alignment: .leading)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                            .shadow(color: Color.black.opacity(0.05), radius: 3, x: 0, y: 2)
                        }
                    }
                }
            }
        }
    }
}


