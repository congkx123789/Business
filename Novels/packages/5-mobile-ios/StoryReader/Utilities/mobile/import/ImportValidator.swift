import Foundation

/// Validates import files before processing
struct ImportValidator {
    enum ValidationError: Error {
        case emptyFile
        case unsupportedFormat
    }
    
    func validate(data: Data, format: ExportImportViewModel.ExportFormat) throws {
        guard !data.isEmpty else {
            throw ValidationError.emptyFile
        }
        
        switch format {
        case .json, .csv, .markdown, .pdf:
            return
        }
    }
}


