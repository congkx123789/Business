import SwiftUI

// Library Auto Organization View - Groups stories by author, series, and system lists
struct LibraryAutoOrganizationView: View {
    enum Segment: String, CaseIterable, Identifiable {
        case authors = "Authors"
        case series = "Series"
        case system = "System Lists"
        
        var id: String { rawValue }
    }
    
    @StateObject private var viewModel = LibraryAutoOrganizationViewModel()
    
    let userId: String
    
    @State private var selectedSegment: Segment = .authors
    
    var body: some View {
        NavigationStack {
            VStack {
                Picker("Grouping", selection: $selectedSegment) {
                    ForEach(Segment.allCases) { segment in
                        Text(segment.rawValue).tag(segment)
                    }
                }
                .pickerStyle(.segmented)
                .padding()
                
                switch selectedSegment {
                case .authors:
                    AuthorGroupView(groups: viewModel.authorGroups)
                case .series:
                    SeriesGroupView(groups: viewModel.seriesGroups)
                case .system:
                    SystemListsView(systemLists: viewModel.systemLists)
                }
            }
            .navigationTitle("Auto Organization")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if viewModel.isLoading {
                        ProgressView()
                    }
                }
            }
            .task {
                loadDataIfNeeded()
            }
            .refreshable {
                loadData(force: true)
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
    
    private func loadDataIfNeeded() {
        if viewModel.authorGroups.isEmpty {
            viewModel.loadAuthorGroups(userId: userId)
        }
        if viewModel.seriesGroups.isEmpty {
            viewModel.loadSeriesGroups(userId: userId)
        }
        if viewModel.systemLists.isEmpty {
            viewModel.loadSystemLists(userId: userId)
        }
    }
    
    private func loadData(force: Bool) {
        if force || viewModel.authorGroups.isEmpty {
            viewModel.loadAuthorGroups(userId: userId)
        }
        if force || viewModel.seriesGroups.isEmpty {
            viewModel.loadSeriesGroups(userId: userId)
        }
        if force || viewModel.systemLists.isEmpty {
            viewModel.loadSystemLists(userId: userId)
        }
    }
}



