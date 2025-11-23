import Foundation
import Combine

/// Handles export workflows (library, annotations, progress)
final class ExportManager {
    static let shared = ExportManager()
    
    private let formatter = ExportFormatter()
    private let historyManager = ExportHistoryManager()
    private let fileManager = FileManager.default
    
    private init() {}
    
    func export(data: DataRepresentable, format: ExportImportViewModel.ExportFormat, fileName: String) async throws -> URL {
        let formattedData = try formatter.format(data: data, format: format)
        let directory = try exportDirectory()
        let url = directory.appendingPathComponent("\(fileName).\(format.fileExtension)")
        try formattedData.write(to: url, options: .atomic)
        historyManager.record(format: format, scope: data.scope, itemCount: data.itemCount, fileURL: url)
        return url
    }
    
    private func exportDirectory() throws -> URL {
        let directory = fileManager.urls(for: .documentDirectory, in: .userDomainMask).first!
            .appendingPathComponent("Exports", isDirectory: true)
        if !fileManager.fileExists(atPath: directory.path) {
            try fileManager.createDirectory(at: directory, withIntermediateDirectories: true)
        }
        return directory
    }
}

protocol DataRepresentable {
    var scope: ExportImportViewModel.ExportScope { get }
    var itemCount: Int { get }
    func encode() throws -> Data
}

extension ExportImportViewModel.ExportFormat {
    var fileExtension: String {
        switch self {
        case .json: return "json"
        case .csv: return "csv"
        case .markdown: return "md"
        case .pdf: return "pdf"
        }
    }
}


