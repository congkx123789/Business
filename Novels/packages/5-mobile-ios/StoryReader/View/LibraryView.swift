import SwiftUI

// Library View - Updated to use ViewModel (MVVM Pattern)
struct LibraryView: View {
    @StateObject private var viewModel = LibraryViewModel()
    @StateObject private var appState = AppState()
    @State private var selectedLayout: LayoutType = .grid
    @State private var sortBy: SortOption = .recent
    @State private var filterBy: FilterOption = .all
    
    enum LayoutType {
        case grid
        case list
    }
    
    enum SortOption: String, CaseIterable {
        case recent = "Recent"
        case title = "Title"
        case progress = "Progress"
        case added = "Added Date"
    }
    
    enum FilterOption: String, CaseIterable {
        case all = "All"
        case reading = "Reading"
        case completed = "Completed"
        case unread = "Unread"
    }
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading library...")
                } else if viewModel.libraryItems.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "books.vertical")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("Your library is empty")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Start reading to add stories to your library")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    // Filter and sort items
                    let filteredItems = viewModel.libraryItems.filter { item in
                        switch filterBy {
                        case .all: return true
                        case .reading: return !item.isCompleted && item.readingProgress != nil
                        case .completed: return item.isCompleted
                        case .unread: return item.readingProgress == nil
                        }
                    }
                    
                    let sortedItems = filteredItems.sorted { item1, item2 in
                        switch sortBy {
                        case .recent:
                            return (item1.lastReadAt ?? item1.addedAt) > (item2.lastReadAt ?? item2.addedAt)
                        case .title:
                            // Sort by storyId (story titles should be fetched from DiscoveryRepository if needed)
                            return item1.storyId < item2.storyId
                        case .progress:
                            return (item1.readingProgress ?? 0) > (item2.readingProgress ?? 0)
                        case .added:
                            return item1.addedAt > item2.addedAt
                        }
                    }
                    
                    if selectedLayout == .grid {
                        ScrollView {
                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                ForEach(sortedItems) { item in
                                    LibraryItemCard(item: item)
                                }
                            }
                            .padding()
                        }
                    } else {
                        List(sortedItems) { item in
                            LibraryItemRow(item: item)
                        }
                    }
                }
            }
            .navigationTitle("Library")
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    // Layout toggle
                    Button(action: {
                        selectedLayout = selectedLayout == .grid ? .list : .grid
                    }) {
                        Image(systemName: selectedLayout == .grid ? "list.bullet" : "square.grid.2x2")
                    }
                    
                    // Sync button
                    Button(action: {
                        viewModel.syncNow(userId: appState.getCurrentUserId())
                    }) {
                        if case .syncing = viewModel.syncStatus {
                            ProgressView()
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "arrow.clockwise")
                        }
                    }
                    .disabled(viewModel.syncStatus == .syncing)
                }
            }
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarLeading) {
                    // Sort picker
                    Menu {
                        ForEach(SortOption.allCases, id: \.self) { option in
                            Button(action: {
                                sortBy = option
                            }) {
                                HStack {
                                    Text(option.rawValue)
                                    if sortBy == option {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        Image(systemName: "arrow.up.arrow.down")
                    }
                    
                    // Filter picker
                    Menu {
                        ForEach(FilterOption.allCases, id: \.self) { option in
                            Button(action: {
                                filterBy = option
                            }) {
                                HStack {
                                    Text(option.rawValue)
                                    if filterBy == option {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .task {
                viewModel.loadLibrary(userId: appState.getCurrentUserId())
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                if let error = viewModel.errorMessage {
                    Text(error)
                }
            }
        }
    }
}

struct LibraryItemRow: View {
    let item: LibraryItem
    
    var body: some View {
        HStack(spacing: 16) {
            Rectangle()
                .fill(Color.purple.opacity(0.2))
                .frame(width: 48, height: 64)
                .cornerRadius(8)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.storyId) // Story title should be fetched from DiscoveryRepository.getStory(id: item.storyId) if needed
                    .font(.headline)
                
                if let progress = item.readingProgress, progress > 0 {
                    ProgressView(value: progress)
                        .tint(.blue)
                    Text("\(Int(progress * 100))% complete")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                if item.syncStatus != .synced {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundColor(.orange)
                            .font(.caption)
                        Text(item.syncStatus.rawValue)
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
            }
        }
    }
}

