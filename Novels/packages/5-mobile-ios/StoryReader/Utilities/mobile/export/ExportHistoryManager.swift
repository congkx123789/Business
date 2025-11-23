import Foundation

/// Tracks export history for UI display
final class ExportHistoryManager {
    private let defaultsKey = "exportHistory"
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    func record(format: ExportImportViewModel.ExportFormat, scope: ExportImportViewModel.ExportScope, itemCount: Int, fileURL: URL) {
        var history = loadHistory()
        let entry = HistoryEntry(
            id: UUID().uuidString,
            format: format.rawValue,
            scope: scope.displayName,
            itemCount: itemCount,
            fileSize: fileSize(for: fileURL),
            exportedAt: Date(),
            filePath: fileURL.path
        )
        history.insert(entry, at: 0)
        save(history: history)
    }
    
    func loadHistory() -> [HistoryEntry] {
        guard
            let data = UserDefaults.standard.data(forKey: defaultsKey),
            let history = try? decoder.decode([HistoryEntry].self, from: data)
        else {
            return []
        }
        return history
    }
    
    private func save(history: [HistoryEntry]) {
        if let data = try? encoder.encode(history) {
            UserDefaults.standard.set(data, forKey: defaultsKey)
        }
    }
    
    private func fileSize(for url: URL) -> Int64 {
        (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int64) ?? 0
    }
    
    struct HistoryEntry: Codable {
        let id: String
        let format: String
        let scope: String
        let itemCount: Int
        let fileSize: Int64
        let exportedAt: Date
        let filePath: String
    }
}

private extension ExportImportViewModel.ExportScope {
    var displayName: String {
        switch self {
        case .library: return "Library"
        case .annotations: return "Annotations"
        case .readingProgress: return "Reading Progress"
        case .all: return "Everything"
        }
    }
}


