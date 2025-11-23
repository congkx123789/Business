import Foundation

/// Coordinates validation + mapping + persistence
final class ImportManager {
    private let validator = ImportValidator()
    private let mapper = ImportMapper()
    private let offlineService = OfflineService()
    
    func `import`(data: Data, format: ExportImportViewModel.ExportFormat, scope: ExportImportViewModel.ExportScope) async throws {
        try validator.validate(data: data, format: format)
        switch scope {
        case .library:
            let items = try mapper.mapLibraryItems(from: data)
            try saveLibraryItems(items)
        case .annotations:
            let annotations = try mapper.mapAnnotations(from: data)
            try saveAnnotations(annotations)
        case .readingProgress, .all:
            break
        }
    }
    
    private func saveLibraryItems(_ items: [LibraryItem]) throws {
        for item in items {
            try offlineService.saveLibraryItem(item)
        }
    }
    
    private func saveAnnotations(_ annotations: [Annotation]) throws {
        for annotation in annotations {
            try offlineService.saveAnnotation(annotation)
        }
    }
}


