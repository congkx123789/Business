import SwiftUI

// Advanced Search View - Power-user search experience
struct AdvancedSearchView: View {
    @StateObject private var viewModel = AdvancedSearchViewModel()
    
    let userId: String
    
    @State private var query: String = ""
    @State private var showFilterBuilder = false
    @State private var activeFilter: FilterQuery?
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                searchBar
                suggestionList
                resultList
            }
            .navigationTitle("Advanced Search")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showFilterBuilder = true
                    } label: {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                    }
                }
            }
            .sheet(isPresented: $showFilterBuilder) {
                FilteredViewBuilderView { _, _, query, _ in
                    activeFilter = query
                    viewModel.search(query: self.query, filters: query)
                }
            }
            .task {
                viewModel.loadSearchHistory()
                viewModel.loadFilterPresets()
            }
        }
    }
    
    private var searchBar: some View {
        VStack(spacing: 8) {
            TextField("Search stories, authors, annotations...", text: $query)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal)
                .onSubmit {
                    viewModel.search(query: query, filters: activeFilter)
                }
                .onChange(of: query) { newValue in
                    viewModel.getSearchSuggestions(query: newValue)
                }
            
            SearchHistoryView(history: viewModel.searchHistory) { selected in
                query = selected
                viewModel.search(query: selected, filters: activeFilter)
            }
            .padding(.horizontal)
        }
        .padding(.top)
    }
    
    private var suggestionList: some View {
        SearchSuggestionsView(suggestions: viewModel.searchSuggestions) { suggestion in
            query = suggestion
            viewModel.search(query: suggestion, filters: activeFilter)
        }
        .padding(.horizontal)
    }
    
    private var resultList: some View {
        Group {
            if viewModel.isLoading && viewModel.searchResults.isEmpty {
                ProgressView("Searching...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if viewModel.searchResults.isEmpty {
                Text("No results yet")
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                List(viewModel.searchResults) { item in
                    LibraryItemRow(item: item)
                }
                .listStyle(.plain)
            }
        }
    }
}


