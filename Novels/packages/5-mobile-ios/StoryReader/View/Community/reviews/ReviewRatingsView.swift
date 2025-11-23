import SwiftUI

struct ReviewRatingsView: View {
    let rating: Double
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundColor(.yellow)
            Text(String(format: "%.1f", rating))
                .font(.headline)
        }
        .padding(6)
        .background(Color.yellow.opacity(0.15))
        .cornerRadius(8)
    }
}


