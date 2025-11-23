import SwiftUI

// Storage Manager View - Storage usage and cleanup
struct StorageManagerView: View {
    @StateObject private var viewModel = DownloadManagerViewModel()
    @State private var showingCleanupConfirmation = false
    
    var body: some View {
        NavigationStack {
            List {
                // Storage Overview
                Section {
                    VStack(spacing: 16) {
                        // Storage usage chart
                        ZStack {
                            Circle()
                                .stroke(Color(.systemGray5), lineWidth: 12)
                            
                            Circle()
                                .trim(from: 0, to: storagePercentage)
                                .stroke(storageColor, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                                .rotationEffect(.degrees(-90))
                            
                            VStack(spacing: 4) {
                                Text(viewModel.formatStorageSize(viewModel.storageUsage))
                                    .font(.title2)
                                    .fontWeight(.bold)
                                Text("Used")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .frame(width: 120, height: 120)
                        
                        // Storage details
                        VStack(spacing: 8) {
                            StorageRow(label: "Total Storage", value: formatTotalStorage())
                            StorageRow(label: "Available", value: formatAvailableStorage())
                            StorageRow(label: "Used", value: viewModel.formatStorageSize(viewModel.storageUsage))
                        }
                    }
                    .padding(.vertical, 8)
                } header: {
                    Text("Storage Overview")
                }
                
                // Cleanup Options
                Section {
                    Button(action: {
                        showingCleanupConfirmation = true
                    }) {
                        HStack {
                            Image(systemName: "trash")
                            Text("Clear All Downloads")
                            Spacer()
                            Image(systemName: "chevron.right")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .foregroundColor(.red)
                } header: {
                    Text("Cleanup")
                } footer: {
                    Text("This will delete all downloaded chapters. You can re-download them later.")
                }
            }
            .navigationTitle("Storage")
            .onAppear {
                viewModel.updateStorageUsage()
            }
            .alert("Clear All Downloads", isPresented: $showingCleanupConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Clear", role: .destructive) {
                    clearAllDownloads()
                }
            } message: {
                Text("This will delete all downloaded chapters. This action cannot be undone.")
            }
        }
    }
    
    private var storagePercentage: CGFloat {
        let total = getTotalStorage()
        guard total > 0 else { return 0 }
        return min(CGFloat(viewModel.storageUsage) / CGFloat(total), 1.0)
    }
    
    private var storageColor: Color {
        let percentage = storagePercentage
        if percentage > 0.9 {
            return .red
        } else if percentage > 0.7 {
            return .orange
        } else {
            return .blue
        }
    }
    
    private func getTotalStorage() -> Int64 {
        // Get device total storage
        if let attributes = try? FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory()),
           let totalSize = attributes[.systemSize] as? Int64 {
            return totalSize
        }
        return 0
    }
    
    private func formatTotalStorage() -> String {
        let total = getTotalStorage()
        return ByteCountFormatter.string(fromByteCount: total, countStyle: .file)
    }
    
    private func formatAvailableStorage() -> String {
        let total = getTotalStorage()
        let available = total - viewModel.storageUsage
        return ByteCountFormatter.string(fromByteCount: max(available, 0), countStyle: .file)
    }
    
    private func clearAllDownloads() {
        // Clear all downloads
        DownloadManager.shared.clearAllDownloads()
        viewModel.updateStorageUsage()
    }
}

struct StorageRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .foregroundColor(.secondary)
        }
    }
}

