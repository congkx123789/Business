import SwiftUI
import UIKit
import UniformTypeIdentifiers

// Import View - Allows user to import library/archive data
struct ImportView: View {
    @StateObject private var viewModel = ExportImportViewModel()
    
    let userId: String
    
    @State private var selectedFormat: ExportImportViewModel.ExportFormat = .json
    @State private var fileURL: URL?
    @State private var showDocumentPicker = false
    
    var body: some View {
        Form {
            Section("File") {
                if let fileURL {
                    Text(fileURL.lastPathComponent)
                        .font(.subheadline)
                } else {
                    Text("No file selected")
                        .foregroundColor(.secondary)
                }
                Button("Choose File") {
                    showDocumentPicker = true
                }
            }
            
            Section("Format") {
                Picker("Format", selection: $selectedFormat) {
                    ForEach(ExportImportViewModel.ExportFormat.allCases, id: \.self) { format in
                        Text(format.rawValue).tag(format)
                    }
                }
            }
            
            Section {
                Button {
                    if let path = fileURL?.path {
                        viewModel.importData(userId: userId, filePath: path, format: selectedFormat)
                    }
                } label: {
                    Label("Import", systemImage: "square.and.arrow.up")
                }
                .disabled(fileURL == nil || viewModel.isImporting)
                
                if viewModel.isImporting {
                    ProgressView()
                }
            }
        }
        .navigationTitle("Import Data")
        .sheet(isPresented: $showDocumentPicker) {
            DocumentPicker(url: $fileURL)
        }
        .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
            Button("OK") {
                viewModel.errorMessage = nil
            }
        } message: {
            if let error = viewModel.errorMessage {
                Text(error)
            }
        }
    }
}

// MARK: - Document Picker Wrapper

private struct DocumentPicker: UIViewControllerRepresentable {
    @Binding var url: URL?
    
    func makeUIViewController(context: Context) -> UIDocumentPickerViewController {
        let controller = UIDocumentPickerViewController(forOpeningContentTypes: [.data])
        controller.delegate = context.coordinator
        return controller
    }
    
    func updateUIViewController(_ uiViewController: UIDocumentPickerViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    final class Coordinator: NSObject, UIDocumentPickerDelegate {
        let parent: DocumentPicker
        
        init(_ parent: DocumentPicker) {
            self.parent = parent
        }
        
        func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
            parent.url = urls.first
        }
    }
}


