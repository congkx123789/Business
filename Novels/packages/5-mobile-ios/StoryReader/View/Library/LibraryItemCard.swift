import SwiftUI

// Library Item Card - Grid view
struct LibraryItemCard: View {
    let item: LibraryItem
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Cover image
            Rectangle()
                .fill(Color.purple.opacity(0.2))
                .frame(height: 200)
                .cornerRadius(12)
                .overlay(
                    // Progress indicator
                    VStack {
                        Spacer()
                        if let progress = item.readingProgress, progress > 0 {
                            GeometryReader { geometry in
                                Rectangle()
                                    .fill(Color.blue)
                                    .frame(width: geometry.size.width * CGFloat(progress))
                            }
                            .frame(height: 4)
                        }
                    }
                )
            
            // Title
            Text(item.storyId) // Story title should be fetched from DiscoveryRepository.getStory(id: item.storyId) if needed
                .font(.subheadline)
                .fontWeight(.semibold)
                .lineLimit(2)
            
            // Status badge
            if item.syncStatus != .synced {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.caption2)
                        .foregroundColor(.orange)
                    Text(item.syncStatus.rawValue)
                        .font(.caption2)
                        .foregroundColor(.orange)
                }
            }
        }
    }
}

