import SwiftUI

// Summarization View - AI summary of chapters/annotations
struct SummarizationView: View {
    @StateObject private var viewModel = SummarizationViewModel()
    @State private var content: String = ""
    @State private var summaryLength: Double = 0.3
    
    var body: some View {
        Form {
            Section("Content") {
                TextEditor(text: $content)
                    .frame(height: 160)
            }
            
            Section("Summary Length") {
                Slider(value: $summaryLength, in: 0.1...0.6, step: 0.1) {
                    Text("Length")
                }
                Text("Approx. \(Int(summaryLength * 100))% of original text")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Section("Summary") {
                if viewModel.isSummarizing {
                    ProgressView("Generating summary…")
                } else if let summary = viewModel.summary {
                    Text(summary.text)
                        .font(.body)
                } else {
                    Text("Summary will appear here")
                        .foregroundColor(.secondary)
                }
            }
            
            Button {
                Task {
                    await viewModel.summarize(text: content, ratio: summaryLength)
                }
            } label: {
                Label("Summarize", systemImage: "text.book.closed")
            }
            .disabled(content.isEmpty)
        }
        .navigationTitle("AI Summary")
        .alert("Error", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { _ in viewModel.errorMessage = nil }
        )) {
            Button("OK") { }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}


