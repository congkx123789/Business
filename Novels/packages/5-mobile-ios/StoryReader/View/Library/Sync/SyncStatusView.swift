import SwiftUI

// Sync Status View - Displays cross-device sync state
struct SyncStatusView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = SyncStatusViewModel()
    
    let userId: String
    
    @State private var showConflictResolver = false
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Current Status") {
                    HStack {
                        Text("State")
                        Spacer()
                        Label(viewModel.syncStatus.label, systemImage: viewModel.syncStatus.icon)
                            .foregroundColor(viewModel.syncStatus.color)
                    }
                    
                    if let lastSync = viewModel.lastSyncTime {
                        HStack {
                            Text("Last Sync")
                            Spacer()
                            Text(lastSync, style: .relative)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    if viewModel.isSyncing {
                        ProgressView(value: viewModel.syncProgress)
                    }
                }
                
                Section("Queue") {
                    HStack {
                        Text("Pending Operations")
                        Spacer()
                        Text("\(viewModel.pendingOperations)")
                            .font(.headline)
                    }
                    
                    HStack {
                        Text("Conflicts")
                        Spacer()
                        Text("\(viewModel.conflictCount)")
                            .font(.headline)
                            .foregroundColor(viewModel.conflictCount > 0 ? .orange : .secondary)
                    }
                }
                
                Section {
                    Button {
                        viewModel.syncNow(userId: userId)
                    } label: {
                        Label("Sync Now", systemImage: "arrow.clockwise.circle")
                    }
                    .disabled(viewModel.isSyncing)
                    
                    Button {
                        showConflictResolver = true
                    } label: {
                        Label("Resolve Conflicts", systemImage: "exclamationmark.arrow.circlepath")
                    }
                    .disabled(viewModel.conflictCount == 0)
                }
            }
            .navigationTitle("Sync Status")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") { dismiss() }
                }
            }
            .sheet(isPresented: $showConflictResolver) {
                SyncConflictResolverView(viewModel: viewModel, userId: userId)
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

private extension SyncService.SyncStatus {
    var label: String {
        switch self {
        case .idle: return "Idle"
        case .syncing: return "Syncing"
        case .error: return "Error"
        case .conflict: return "Conflict"
        }
    }
    
    var icon: String {
        switch self {
        case .idle: return "checkmark.circle"
        case .syncing: return "arrow.triangle.2.circlepath"
        case .error: return "exclamationmark.triangle"
        case .conflict: return "exclamationmark.arrow.triangle.2.circlepath"
        }
    }
    
    var color: Color {
        switch self {
        case .idle: return .green
        case .syncing: return .blue
        case .error: return .red
        case .conflict: return .orange
        }
    }
}



