import SwiftUI

// Export History View - Shows previous export jobs
struct ExportHistoryView: View {
    @StateObject private var viewModel = ExportImportViewModel()
    
    let userId: String
    
    var body: some View {
        List {
            ForEach(viewModel.exportHistory.indices, id: \.self) { index in
                let record = viewModel.exportHistory[index]
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(record.format.rawValue)
                            .font(.headline)
                        Spacer()
                        Text(record.exportedAt, style: .date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Text("Scope: \(record.scope.displayName)")
                        .font(.subheadline)
                    Text("\(record.itemCount) items • \(ByteCountFormatter.string(fromByteCount: record.fileSize, countStyle: .file))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Export History")
        .task {
            viewModel.loadExportHistory(userId: userId)
        }
    }
}

private extension ExportImportViewModel.ExportScope {
    var displayName: String {
        switch self {
        case .library: return "Library"
        case .annotations: return "Annotations"
        case .readingProgress: return "Reading Progress"
        case .all: return "Everything"
        }
    }
}


