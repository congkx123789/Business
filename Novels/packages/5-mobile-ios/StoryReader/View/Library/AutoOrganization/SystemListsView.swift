import SwiftUI

// System Lists View - Displays smart lists such as Favorites or To Read
struct SystemListsView: View {
    let systemLists: [SystemList]
    
    var body: some View {
        if systemLists.isEmpty {
            PlaceholderView(
                systemImage: "list.star",
                title: "No system lists",
                message: "Favorites, To Read, and other smart lists appear once you start applying the corresponding actions."
            )
        } else {
            List {
                ForEach(systemLists) { list in
                    Section {
                        if let items = list.libraryItems, !items.isEmpty {
                            ForEach(items) { _ in
                                HStack {
                                    Image(systemName: icon(for: list.listType))
                                        .foregroundColor(.accentColor)
                                    Text(label(for: list.listType))
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                            }
                        } else {
                            Text("No stories yet")
                                .foregroundColor(.secondary)
                        }
                    } header: {
                        HStack {
                            Label(label(for: list.listType), systemImage: icon(for: list.listType))
                                .font(.headline)
                            Spacer()
                            Text(list.createdAt, style: .date)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
        }
    }
    
    private func icon(for type: SystemList.SystemListType) -> String {
        switch type {
        case .favorites: return "heart.fill"
        case .toRead: return "bookmark"
        case .haveRead: return "checkmark.circle"
        case .currentlyReading: return "book"
        case .recentlyAdded: return "clock.arrow.circlepath"
        }
    }
    
    private func label(for type: SystemList.SystemListType) -> String {
        switch type {
        case .favorites: return "Favorites"
        case .toRead: return "To Read"
        case .haveRead: return "Completed"
        case .currentlyReading: return "Currently Reading"
        case .recentlyAdded: return "Recently Added"
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



