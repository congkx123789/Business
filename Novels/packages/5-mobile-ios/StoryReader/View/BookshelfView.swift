import SwiftUI

// Bookshelf View - Virtual bookshelf management UI
struct BookshelfView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = BookshelfViewModel()
    
    let userId: String
    
    @State private var showCreateSheet = false
    @State private var selectedBookshelf: Bookshelf?
    @State private var searchText: String = ""
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.bookshelves.isEmpty {
                    ProgressView("Loading bookshelves...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.bookshelves.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "books.vertical.circle")
                            .font(.system(size: 56))
                            .foregroundColor(.secondary)
                        Text("Create your first bookshelf")
                            .font(.headline)
                        Text("Organize stories into themed shelves for easier access across devices.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    List {
                        ForEach(filteredShelves) { shelf in
                            Section {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(shelf.name)
                                            .font(.headline)
                                        if shelf.isDefault {
                                            Label("Default", systemImage: "star.fill")
                                                .font(.caption)
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 4)
                                                .background(Color.accentColor.opacity(0.15))
                                                .clipShape(Capsule())
                                        }
                                        Spacer()
                                        Text("\(shelf.items?.count ?? 0) items")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    if let description = shelf.description, !description.isEmpty {
                                        Text(description)
                                            .font(.subheadline)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                .contentShape(Rectangle())
                                .onTapGesture {
                                    selectedBookshelf = shelf
                                }
                            }
                        }
                    }
                    .listStyle(.insetGrouped)
                    .searchable(text: $searchText, prompt: "Search bookshelves")
                    .refreshable {
                        viewModel.loadBookshelves(userId: userId)
                    }
                }
            }
            .navigationTitle("Bookshelves")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showCreateSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .task {
                if viewModel.bookshelves.isEmpty {
                    viewModel.loadBookshelves(userId: userId)
                }
            }
            .sheet(item: $selectedBookshelf) { shelf in
                BookshelfDetailView(bookshelf: shelf, userId: userId, viewModel: viewModel)
            }
            .sheet(isPresented: $showCreateSheet) {
                BookshelfEditorView(mode: .create) { name, description in
                    viewModel.createBookshelf(userId: userId, name: name, description: description)
                }
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
    
    private var filteredShelves: [Bookshelf] {
        guard !searchText.isEmpty else {
            return viewModel.bookshelves
        }
        return viewModel.bookshelves.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }
}

// MARK: - Detail View

private struct BookshelfDetailView: View {
    let bookshelf: Bookshelf
    let userId: String
    @ObservedObject var viewModel: BookshelfViewModel
    
    @State private var showRenameSheet = false
    @State private var showDeleteConfirmation = false
    
    var body: some View {
        NavigationStack {
            Group {
                if let items = bookshelf.items, !items.isEmpty {
                    List {
                        ForEach(items) { bookshelfItem in
                            if let libraryItem = bookshelfItem.library {
                                LibraryItemRow(item: libraryItem)
                            } else {
                                Text("Library item \(bookshelfItem.libraryId)")
                                    .font(.subheadline)
                            }
                        }
                    }
                } else {
                    VStack(spacing: 16) {
                        Image(systemName: "tray")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No items in this bookshelf")
                            .font(.headline)
                        Text("Use the library bulk actions or item menus to add stories.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                }
            }
            .navigationTitle(bookshelf.name)
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button {
                        showRenameSheet = true
                    } label: {
                        Image(systemName: "pencil")
                    }
                    
                    Button(role: .destructive) {
                        showDeleteConfirmation = true
                    } label: {
                        Image(systemName: "trash")
                    }
                    .disabled(bookshelf.isDefault)
                }
            }
            .sheet(isPresented: $showRenameSheet) {
                BookshelfEditorView(mode: .edit(existingName: bookshelf.name, existingDescription: bookshelf.description)) { name, description in
                    viewModel.updateBookshelf(userId: userId, bookshelfId: bookshelf.id, name: name, description: description)
                }
            }
            .confirmationDialog("Delete \(bookshelf.name)?", isPresented: $showDeleteConfirmation, titleVisibility: .visible) {
                Button("Delete Bookshelf", role: .destructive) {
                    viewModel.deleteBookshelf(userId: userId, bookshelfId: bookshelf.id)
                }
                Button("Cancel", role: .cancel) { }
            } message: {
                Text("This action removes the bookshelf but keeps the stories in your library.")
            }
        }
    }
}

// MARK: - Editor View

private struct BookshelfEditorView: View {
    enum Mode {
        case create
        case edit(existingName: String, existingDescription: String?)
        
        var title: String {
            switch self {
            case .create: return "New Bookshelf"
            case .edit: return "Edit Bookshelf"
            }
        }
    }
    
    @Environment(\.dismiss) private var dismiss
    let mode: Mode
    let onSave: (String, String?) -> Void
    
    @State private var name: String = ""
    @State private var description: String = ""
    
    init(mode: Mode, onSave: @escaping (String, String?) -> Void) {
        self.mode = mode
        self.onSave = onSave
        
        switch mode {
        case .create:
            _name = State(initialValue: "")
            _description = State(initialValue: "")
        case .edit(let existingName, let existingDescription):
            _name = State(initialValue: existingName)
            _description = State(initialValue: existingDescription ?? "")
        }
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                    TextField("Description", text: $description)
                }
            }
            .navigationTitle(mode.title)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(name, description.isEmpty ? nil : description)
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}



