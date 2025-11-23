import SwiftUI

// Series Group View - Displays books grouped by series
struct SeriesGroupView: View {
    let groups: [LibraryAutoOrganizationViewModel.SeriesGroup]
    
    var body: some View {
        if groups.isEmpty {
            PlaceholderView(
                systemImage: "books.vertical",
                title: "No series detected",
                message: "Series groups appear automatically when your library includes multi-volume stories."
            )
        } else {
            List {
                ForEach(groups, id: \.seriesId) { group in
                    Section {
                        VStack(alignment: .leading, spacing: 12) {
                            ForEach(group.stories) { item in
                                LibraryItemRow(item: item)
                            }
                        }
                        .padding(.vertical, 4)
                    } header: {
                        HStack {
                            VStack(alignment: .leading) {
                                Text(group.seriesName)
                                    .font(.headline)
                                Text("\(group.stories.count) volumes")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
        }
    }
}

private struct PlaceholderView: View {
    let systemImage: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: systemImage)
                .font(.system(size: 48))
                .foregroundColor(.secondary)
            Text(title)
                .font(.headline)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}



