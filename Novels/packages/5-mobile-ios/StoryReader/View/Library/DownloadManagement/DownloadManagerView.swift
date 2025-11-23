import SwiftUI

// Download Manager View - Download queue and management
struct DownloadManagerView: View {
    @StateObject private var viewModel = DownloadManagerViewModel()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Storage usage
                VStack(spacing: 8) {
                    Text("Storage Usage")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(viewModel.formatStorageSize(viewModel.storageUsage))
                        .font(.title2)
                        .fontWeight(.bold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemGray6))
                
                // Active downloads
                if !viewModel.activeDownloads.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Downloading")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        ForEach(Array(viewModel.activeDownloads.values), id: \.id) { task in
                            DownloadTaskRow(task: task) {
                                viewModel.cancelDownload(chapterId: task.chapterId)
                            }
                        }
                    }
                    .padding(.vertical)
                }
                
                // Download queue
                if !viewModel.downloadQueue.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Queue")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        ForEach(viewModel.downloadQueue) { task in
                            DownloadTaskRow(task: task) {
                                viewModel.cancelDownload(chapterId: task.chapterId)
                            }
                        }
                    }
                    .padding(.vertical)
                }
                
                if viewModel.downloadQueue.isEmpty && viewModel.activeDownloads.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "arrow.down.circle")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No downloads")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Download chapters for offline reading")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                
                Spacer()
            }
            .navigationTitle("Downloads")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: {
                        viewModel.updateStorageUsage()
                    }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
    }
}

struct DownloadTaskRow: View {
    let task: DownloadManager.DownloadTask
    let onCancel: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.chapterTitle)
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    if task.status == .downloading {
                        ProgressView(value: task.progress)
                            .tint(.blue)
                        Text("\(Int(task.progress * 100))%")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Text(task.statusString)
                            .font(.caption)
                            .foregroundColor(task.statusColor)
                    }
                }
                
                Spacer()
                
                if task.status == .downloading || task.status == .pending {
                    Button(action: onCancel) {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.red)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
        .padding(.horizontal)
    }
}

extension DownloadManager.DownloadTask {
    var statusString: String {
        switch status {
        case .pending: return "Pending"
        case .downloading: return "Downloading"
        case .completed: return "Completed"
        case .failed: return "Failed"
        case .cancelled: return "Cancelled"
        }
    }
    
    var statusColor: Color {
        switch status {
        case .pending: return .orange
        case .downloading: return .blue
        case .completed: return .green
        case .failed: return .red
        case .cancelled: return .gray
        }
    }
}

