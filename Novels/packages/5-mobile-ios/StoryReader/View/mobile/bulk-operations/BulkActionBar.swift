import SwiftUI

// Bulk Action Bar - Shows available batch actions
struct BulkActionBar: View {
    @ObservedObject var viewModel: BulkOperationsViewModel
    let userId: String
    
    var body: some View {
        VStack(spacing: 12) {
            if !viewModel.selectedItems.isEmpty {
                Text("\(viewModel.selectedItems.count) selected")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            
            HStack(spacing: 12) {
                Button(role: .destructive) {
                    viewModel.deleteSelected(userId: userId)
                } label: {
                    Label("Delete", systemImage: "trash")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(viewModel.selectedItems.isEmpty)
                
                Button {
                    viewModel.clearSelection()
                } label: {
                    Label("Clear", systemImage: "xmark.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .disabled(viewModel.selectedItems.isEmpty)
            }
        }
        .padding()
    }
}


