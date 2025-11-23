import SwiftUI

// Translation View - Integrates AI translation UI
struct TranslationView: View {
    @StateObject private var viewModel = TranslationViewModel()
    @State private var sourceText: String = ""
    @State private var targetLanguage: String = "en"
    
    var body: some View {
        Form {
            Section("Source") {
                TextEditor(text: $sourceText)
                    .frame(height: 120)
            }
            
            Section("Target Language") {
                Picker("Language", selection: $targetLanguage) {
                    Text("English").tag("en")
                    Text("Vietnamese").tag("vi")
                    Text("Chinese").tag("zh")
                }
                .pickerStyle(.segmented)
            }
            
            Section("Result") {
                if viewModel.isTranslating {
                    ProgressView("Translating…")
                } else if let translation = viewModel.translation {
                    Text(translation.translatedText)
                        .font(.headline)
                } else {
                    Text("Result will appear here")
                        .foregroundColor(.secondary)
                }
            }
            
            Button {
                Task {
                    await viewModel.translate(text: sourceText, targetLanguage: targetLanguage)
                }
            } label: {
                Label("Translate", systemImage: "globe")
            }
            .disabled(sourceText.isEmpty)
        }
        .navigationTitle("AI Translation")
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


