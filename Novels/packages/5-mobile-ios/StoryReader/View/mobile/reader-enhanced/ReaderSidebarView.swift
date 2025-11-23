import SwiftUI

// Reader Sidebar View - Shows bookmarks and annotations alongside reader
struct ReaderSidebarView: View {
    @ObservedObject var viewModel: StoryReaderViewModel
    
    var body: some View {
        List {
            Section("Bookmarks") {
                ForEach(viewModel.bookmarks, id: \.id) { bookmark in
                    VStack(alignment: .leading) {
                        Text("Position \(Int(bookmark.position * 100))%")
                            .font(.headline)
                        if let note = bookmark.note {
                            Text(note)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
            
            Section("Annotations") {
                ForEach(viewModel.annotations, id: \.id) { annotation in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(annotation.selectedText)
                            .font(.headline)
                        if let note = annotation.note {
                            Text(note)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .frame(maxWidth: 320)
    }
}


