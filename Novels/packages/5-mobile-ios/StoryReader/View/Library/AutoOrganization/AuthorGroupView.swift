import SwiftUI

// Author Group View - Displays books grouped by author
struct AuthorGroupView: View {
    let groups: [LibraryAutoOrganizationViewModel.AuthorGroup]
    
    var body: some View {
        if groups.isEmpty {
            ContentPlaceholderView(
                systemImage: "person.3.sequence",
                title: "No author groups yet",
                message: "Once you add more stories, we'll automatically group them by author."
            )
        } else {
            List {
                ForEach(groups, id: \.authorId) { group in
                    Section {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(group.stories) { item in
                                    LibraryItemCard(item: item)
                                        .frame(width: 180)
                                }
                            }
                            .padding(.vertical, 8)
                        }
                    } header: {
                        HStack {
                            Text(group.authorName)
                                .font(.headline)
                            Spacer()
                            Text("\(group.stories.count) stories")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
        }
    }
}

// MARK: - Placeholder

private struct ContentPlaceholderView: View {
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


