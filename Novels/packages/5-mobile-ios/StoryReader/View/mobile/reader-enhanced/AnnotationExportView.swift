import SwiftUI

// Annotation Export View - Export annotations as Markdown/PDF
struct AnnotationExportView: View {
    @StateObject private var exportViewModel = ExportImportViewModel()
    let annotations: [Annotation]
    let userId: String
    
    @State private var selectedFormat: ExportImportViewModel.ExportFormat = .markdown
    
    var body: some View {
        Form {
            Section("Format") {
                Picker("Format", selection: $selectedFormat) {
                    Text("Markdown").tag(ExportImportViewModel.ExportFormat.markdown)
                    Text("PDF").tag(ExportImportViewModel.ExportFormat.pdf)
                    Text("JSON").tag(ExportImportViewModel.ExportFormat.json)
                }
                .pickerStyle(.segmented)
            }
            
            Section {
                Button {
                    exportViewModel.export(
                        userId: userId,
                        format: selectedFormat,
                        scope: .annotations,
                        itemIds: annotations.map { $0.id }
                    )
                } label: {
                    Label("Export Annotations", systemImage: "square.and.arrow.down")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(exportViewModel.isExporting)
                
                if exportViewModel.isExporting {
                    ProgressView(value: exportViewModel.exportProgress)
                }
            }
        }
        .navigationTitle("Export Annotations")
        .alert("Export Complete", isPresented: Binding(
            get: { exportViewModel.exportSuccess },
            set: { _ in exportViewModel.exportSuccess = false }
        )) {
            Button("OK") { }
        } message: {
            Text("Annotation export ready in Files app.")
        }
    }
}


