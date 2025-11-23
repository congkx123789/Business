import SwiftUI

// Export View - Configure export format and scope
struct ExportView: View {
    @StateObject private var viewModel = ExportImportViewModel()
    
    let userId: String
    
    @State private var selectedFormat: ExportImportViewModel.ExportFormat = .json
    @State private var selectedScope: ExportImportViewModel.ExportScope = .library
    @State private var includeAnnotations = true
    @State private var includeProgress = true
    
    var body: some View {
        Form {
            Section("Format") {
                Picker("Format", selection: $selectedFormat) {
                    ForEach(ExportImportViewModel.ExportFormat.allCases, id: \.self) { format in
                        Text(format.rawValue).tag(format)
                    }
                }
                .pickerStyle(.segmented)
            }
            
            Section("Scope") {
                Picker("What to export", selection: $selectedScope) {
                    Text("Library").tag(ExportImportViewModel.ExportScope.library)
                    Text("Annotations").tag(ExportImportViewModel.ExportScope.annotations)
                    Text("Reading Progress").tag(ExportImportViewModel.ExportScope.readingProgress)
                    Text("Everything").tag(ExportImportViewModel.ExportScope.all)
                }
            }
            
            Section("Options") {
                Toggle("Include annotations", isOn: $includeAnnotations)
                Toggle("Include reading progress", isOn: $includeProgress)
            }
            
            Section {
                Button {
                    viewModel.export(userId: userId, format: selectedFormat, scope: selectedScope)
                } label: {
                    Label("Export Now", systemImage: "square.and.arrow.down")
                }
                .disabled(viewModel.isExporting)
                
                if viewModel.isExporting {
                    ProgressView(value: viewModel.exportProgress)
                }
            }
        }
        .navigationTitle("Export Data")
        .alert("Export Completed", isPresented: $viewModel.exportSuccess) {
            Button("OK") { }
        } message: {
            Text("Find the export file inside the Files app or share it immediately.")
        }
    }
}


