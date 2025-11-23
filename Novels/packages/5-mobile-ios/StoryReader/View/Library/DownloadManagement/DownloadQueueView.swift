import SwiftUI

// Download Queue View - Download queue list
struct DownloadQueueView: View {
    @ObservedObject var viewModel: DownloadManagerViewModel
    
    var body: some View {
        List {
            if viewModel.downloadQueue.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "tray")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("No items in queue")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 40)
            } else {
                ForEach(viewModel.downloadQueue) { task in
                    DownloadQueueRow(task: task) {
                        viewModel.cancelDownload(chapterId: task.chapterId)
                    }
                }
            }
        }
        .navigationTitle("Download Queue")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct DownloadQueueRow: View {
    let task: DownloadManager.DownloadTask
    let onCancel: () -> Void
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(task.chapterTitle)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                Text("Pending")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            Spacer()
            
            Button(action: onCancel) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.red)
            }
        }
        .padding(.vertical, 4)
    }
}

