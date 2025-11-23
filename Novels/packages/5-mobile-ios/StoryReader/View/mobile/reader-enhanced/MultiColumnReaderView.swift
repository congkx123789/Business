import SwiftUI

// Multi Column Reader View - Optimized layout for iPad/desktop mode
struct MultiColumnReaderView: View {
    @ObservedObject var viewModel: StoryReaderViewModel
    let columns: Int
    
    private var columnedParagraphs: [[String]] {
        guard let content = viewModel.chapter?.content else { return [] }
        let paragraphs = content.split(separator: "\n").map(String.init)
        let chunkSize = max(1, paragraphs.count / max(columns, 1))
        return stride(from: 0, to: paragraphs.count, by: chunkSize).map {
            Array(paragraphs[$0..<min($0 + chunkSize, paragraphs.count)])
        }
    }
    
    var body: some View {
        ScrollView {
            HStack(alignment: .top, spacing: 24) {
                ForEach(Array(columnedParagraphs.enumerated()), id: \.offset) { column in
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(column.element, id: \.self) { paragraph in
                            Text(paragraph)
                                .font(.system(size: CGFloat(viewModel.preferences.fontSize)))
                                .lineSpacing(CGFloat(viewModel.preferences.lineHeight))
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
            .padding()
        }
    }
}


