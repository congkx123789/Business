import SwiftUI

// Sync Conflict Resolver View - Provides strategies for resolving sync conflicts
struct SyncConflictResolverView: View {
    @Environment(\.dismiss) private var dismiss
    
    @ObservedObject var viewModel: SyncStatusViewModel
    let userId: String
    
    @State private var selectedStrategy: SyncStatusViewModel.ConflictResolutionStrategy = .lastWriteWins
    @State private var isResolving = false
    @State private var resolutionError: String?
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Strategy") {
                    Picker("Resolution", selection: $selectedStrategy) {
                        ForEach(SyncStatusViewModel.ConflictResolutionStrategy.allCases, id: \.self) { strategy in
                            Text(strategy.label).tag(strategy)
                        }
                    }
                    .pickerStyle(.inline)
                }
                
                Section("Description") {
                    Text(selectedStrategy.description)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                
                if let error = resolutionError {
                    Section {
                        Text(error)
                            .foregroundColor(.red)
                    }
                }
            }
            .navigationTitle("Resolve Conflicts")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Apply") {
                        resolve()
                    }
                    .disabled(isResolving)
                }
            }
            .overlay {
                if isResolving {
                    ProgressView("Resolving...")
                        .progressViewStyle(.circular)
                }
            }
        }
    }
    
    private func resolve() {
        isResolving = true
        resolutionError = nil
        Task {
            await viewModel.resolveConflicts(userId: userId, strategy: selectedStrategy)
            await MainActor.run {
                isResolving = false
                if viewModel.errorMessage == nil {
                    dismiss()
                } else {
                    resolutionError = viewModel.errorMessage
                }
            }
        }
    }
}

private extension SyncStatusViewModel.ConflictResolutionStrategy: CaseIterable {
    var label: String {
        switch self {
        case .lastWriteWins: return "Last Write Wins"
        case .serverWins: return "Server Wins"
        case .clientWins: return "Device Wins"
        case .merge: return "Merge Fields"
        }
    }
    
    var description: String {
        switch self {
        case .lastWriteWins:
            return "Use the most recently updated record regardless of origin."
        case .serverWins:
            return "Always keep the server copy and discard local changes."
        case .clientWins:
            return "Keep the local copy and overwrite the server."
        case .merge:
            return "Attempt to merge fields intelligently (where supported)."
        }
    }
}



