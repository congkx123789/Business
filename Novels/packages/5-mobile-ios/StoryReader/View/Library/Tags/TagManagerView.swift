import SwiftUI

// Tag Manager View - Create, edit, and organize tags
struct TagManagerView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = TagsViewModel()
    
    let userId: String
    
    @State private var showCreateSheet = false
    @State private var selectedTag: Tag?
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.tags.isEmpty {
                    ProgressView("Loading tags...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.tags.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "tag")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No tags yet")
                            .font(.headline)
                        Text("Create custom tags to organize stories across shelves, filters, and devices.")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding()
                } else {
                    List {
                        TagHierarchyView(tags: viewModel.tags) { tag in
                            selectedTag = tag
                        }
                    }
                    .listStyle(.insetGrouped)
                }
            }
            .navigationTitle("Tags")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
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
                if viewModel.tags.isEmpty {
                    viewModel.loadTags(userId: userId)
                }
            }
            .refreshable {
                viewModel.loadTags(userId: userId)
            }
            .sheet(isPresented: $showCreateSheet) {
                TagEditorView(mode: .create) { name, color, icon, parent in
                    viewModel.createTag(userId: userId, name: name, color: color, icon: icon, parentTagId: parent)
                }
            }
            .sheet(item: $selectedTag) { tag in
                TagDetailView(tag: tag, viewModel: viewModel, userId: userId)
            }
        }
    }
}

// MARK: - Tag Detail

private struct TagDetailView: View, Identifiable {
    let id = UUID()
    let tag: Tag
    @ObservedObject var viewModel: TagsViewModel
    let userId: String
    
    @State private var showEditSheet = false
    
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                TagChipView(tag: tag)
                    .padding(.top)
                
                if let children = tag.childTags, !children.isEmpty {
                    Text("Child Tags")
                        .font(.headline)
                    TagHierarchyView(tags: children, onTagSelected: { _ in
                        // Child selection handled by parent sheet
                    })
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle(tag.name)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Edit") {
                        showEditSheet = true
                    }
                }
            }
            .sheet(isPresented: $showEditSheet) {
                TagEditorView(mode: .edit(existingName: tag.name, existingColor: tag.color, existingIcon: tag.icon)) { name, color, icon, _ in
                    viewModel.updateTag(userId: userId, tagId: tag.id, name: name, color: color, icon: icon)
                }
            }
        }
    }
}

// MARK: - Editor

private struct TagEditorView: View {
    enum Mode {
        case create
        case edit(existingName: String, existingColor: String?, existingIcon: String?)
        
        var title: String {
            switch self {
            case .create: return "New Tag"
            case .edit: return "Edit Tag"
            }
        }
    }
    
    @Environment(\.dismiss) private var dismiss
    let mode: Mode
    let onSave: (String, String?, String?, String?) -> Void
    
    @State private var name: String = ""
    @State private var color: String = ""
    @State private var icon: String = ""
    @State private var parentTagId: String = ""
    
    init(mode: Mode, onSave: @escaping (String, String?, String?, String?) -> Void) {
        self.mode = mode
        self.onSave = onSave
        
        switch mode {
        case .create:
            _name = State(initialValue: "")
            _color = State(initialValue: "")
            _icon = State(initialValue: "")
        case .edit(let existingName, let existingColor, let existingIcon):
            _name = State(initialValue: existingName)
            _color = State(initialValue: existingColor ?? "")
            _icon = State(initialValue: existingIcon ?? "")
        }
    }
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Name", text: $name)
                    TextField("Icon (SF Symbol)", text: $icon)
                    TextField("Hex Color (#AABBCC)", text: $color)
                    TextField("Parent Tag ID (optional)", text: $parentTagId)
                }
            }
            .navigationTitle(mode.title)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(
                            name,
                            color.isEmpty ? nil : color,
                            icon.isEmpty ? nil : icon,
                            parentTagId.isEmpty ? nil : parentTagId
                        )
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}


