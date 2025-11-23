import SwiftUI

// Bulk Selection View - Grid/list for selecting multiple library items
struct BulkSelectionView: View {
    @StateObject private var bulkViewModel = BulkOperationsViewModel()
    @StateObject private var libraryViewModel = LibraryViewModel()
    
    let userId: String
    
    private let columns = [GridItem(.flexible()), GridItem(.flexible())]
    
    var body: some View {
        NavigationStack {
            Group {
                if libraryViewModel.isLoading && libraryViewModel.libraryItems.isEmpty {
                    ProgressView("Loading library...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if libraryViewModel.libraryItems.isEmpty {
                    Text("Your library is empty.")
                        .foregroundColor(.secondary)
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(libraryViewModel.libraryItems) { item in
                                VStack {
                                    LibraryItemCard(item: item)
                                    Toggle("Select", isOn: Binding(
                                        get: { bulkViewModel.selectedItems.contains(item.id) },
                                        set: { isSelected in
                                            if isSelected {
                                                bulkViewModel.selectedItems.insert(item.id)
                                            } else {
                                                bulkViewModel.selectedItems.remove(item.id)
                                            }
                                        })
                                    )
                                    .labelsHidden()
                                }
                                .padding()
                                .background(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(bulkViewModel.selectedItems.contains(item.id) ? Color.accentColor : Color.secondary.opacity(0.2), lineWidth: 2)
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Bulk Selection")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Select All") {
                        bulkViewModel.selectAll(itemIds: libraryViewModel.libraryItems.map { $0.id })
                    }
                    .disabled(libraryViewModel.libraryItems.isEmpty)
                }
            }
            .safeAreaInset(edge: .bottom) {
                BulkActionBar(viewModel: bulkViewModel, userId: userId)
                    .background(.ultraThinMaterial)
            }
            .task {
                if libraryViewModel.libraryItems.isEmpty {
                    libraryViewModel.loadLibrary(userId: userId)
                }
            }
        }
    }
}


