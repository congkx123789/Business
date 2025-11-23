import SwiftUI

// Filtered View List - Manage saved smart queries
struct FilteredViewListView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = FilteredViewViewModel()
    
    let userId: String
    
    @State private var showBuilder = false
    @State private var selectedView: FilteredView?
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.filteredViews.isEmpty {
                    ProgressView("Loading filtered views...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.filteredViews.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("Build advanced filters")
                            .font(.headline)
                        Text("Create saved queries that sync across web, desktop, iOS, and Android.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                } else {
                    List {
                        ForEach(viewModel.filteredViews) { filteredView in
                            Button {
                                selectedView = filteredView
                                viewModel.executeFilter(userId: userId, query: filteredView.query)
                            } label: {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(filteredView.name)
                                        .font(.headline)
                                    if let description = filteredView.description {
                                        Text(description)
                                            .font(.subheadline)
                                            .foregroundColor(.secondary)
                                    }
                                    Text(filteredView.isAutoUpdating ? "Auto-updating" : "Manual")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .onDelete { indexSet in
                            for index in indexSet {
                                let view = viewModel.filteredViews[index]
                                viewModel.deleteFilteredView(userId: userId, viewId: view.id)
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                    .refreshable {
                        viewModel.loadFilteredViews(userId: userId)
                    }
                }
            }
            .navigationTitle("Filtered Views")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showBuilder = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .task {
                if viewModel.filteredViews.isEmpty {
                    viewModel.loadFilteredViews(userId: userId)
                }
            }
            .sheet(isPresented: $showBuilder) {
                FilteredViewBuilderView { name, description, query, autoUpdate in
                    viewModel.createFilteredView(userId: userId, name: name, description: description, query: query, isAutoUpdating: autoUpdate)
                }
            }
            .sheet(item: $selectedView) { filteredView in
                FilteredResultsView(filteredView: filteredView, results: viewModel.filteredResults)
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

// MARK: - Results

private struct FilteredResultsView: View, Identifiable {
    let id = UUID()
    let filteredView: FilteredView
    let results: [LibraryItem]
    
    var body: some View {
        NavigationStack {
            if results.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("No results")
                        .font(.headline)
                    Text("Try adjusting your filters or run the query later.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                List(results) { item in
                    LibraryItemRow(item: item)
                }
            }
            .navigationTitle(filteredView.name)
        }
    }
}



