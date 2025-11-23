import SwiftUI

// Group List View - Browse and manage book clubs/groups
struct GroupListView: View {
    @StateObject private var viewModel = GroupViewModel()
    
    let userId: String
    
    @State private var showCreateSheet = false
    @State private var selectedGroup: Group?
    
    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.groups.isEmpty {
                    ProgressView("Loading groups...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.groups.isEmpty {
                    EmptyPlaceholderView(
                        systemImage: "person.3",
                        title: "Join a Book Club",
                        message: "Find reading groups, track schedules, and discuss chapters in real time."
                    )
                } else {
                    List {
                        ForEach(viewModel.groups) { group in
                            Button {
                                selectedGroup = group
                            } label: {
                                GroupRow(group: group)
                            }
                        }
                    }
                    .listStyle(.plain)
                    .refreshable {
                        viewModel.loadGroups(userId: userId)
                    }
                }
            }
            .navigationTitle("Book Clubs")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showCreateSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .task {
                if viewModel.groups.isEmpty {
                    viewModel.loadGroups(userId: userId)
                }
            }
            .sheet(isPresented: $showCreateSheet) {
                CreateGroupSheet { name, description, type, isPublic in
                    viewModel.createGroup(userId: userId, name: name, description: description, type: type, isPublic: isPublic)
                }
            }
            .sheet(item: $selectedGroup) { group in
                GroupDetailView(group: group, userId: userId)
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

private struct GroupRow: View {
    let group: Group
    
    var body: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.accentColor.opacity(0.2))
                    .frame(width: 48, height: 48)
                Image(systemName: group.type == .bookClub ? "book.circle" : "person.3")
                    .foregroundColor(.accentColor)
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(group.name)
                    .font(.headline)
                if let description = group.description {
                    Text(description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
                HStack(spacing: 12) {
                    Label("\(group.memberCount)", systemImage: "person.2")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Label(group.isPublic ? "Public" : "Private", systemImage: group.isPublic ? "globe" : "lock.fill")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
        .padding(.vertical, 8)
    }
}

private struct EmptyPlaceholderView: View {
    let systemImage: String
    let title: String
    let message: String
    
    var body: some View {
        VStack(spacing: 16) {
            Image(systemImage: systemImage)
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

private struct CreateGroupSheet: View {
    @Environment(\.dismiss) private var dismiss
    
    let onCreate: (String, String?, Group.GroupType, Bool) -> Void
    
    @State private var name: String = ""
    @State private var description: String = ""
    @State private var type: Group.GroupType = .bookClub
    @State private var isPublic: Bool = true
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Group name", text: $name)
                    TextField("Description", text: $description)
                }
                
                Section("Type") {
                    Picker("Type", selection: $type) {
                        Text("Book Club").tag(Group.GroupType.bookClub)
                        Text("Community").tag(Group.GroupType.general)
                    }
                    Toggle("Public group", isOn: $isPublic)
                }
            }
            .navigationTitle("Create Group")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") {
                        onCreate(
                            name,
                            description.isEmpty ? nil : description,
                            type,
                            isPublic
                        )
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}


