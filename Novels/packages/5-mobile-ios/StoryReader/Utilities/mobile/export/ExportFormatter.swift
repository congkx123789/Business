import Foundation

/// Converts app data into shareable formats
final class ExportFormatter {
    private let jsonEncoder = JSONEncoder()
    
    func format(data: DataRepresentable, format: ExportImportViewModel.ExportFormat) throws -> Data {
        switch format {
        case .json:
            return try data.encode()
        case .csv:
            return try csvData(from: data)
        case .markdown:
            return try markdownData(from: data)
        case .pdf:
            // Placeholder: in production convert to PDF via PDFKit
            return try markdownData(from: data)
        }
    }
    
    private func csvData(from data: DataRepresentable) throws -> Data {
        guard let json = try JSONSerialization.jsonObject(with: data.encode()) as? [[String: Any]] else {
            return Data()
        }
        let headers = Set(json.flatMap { $0.keys })
        var rows: [String] = [headers.joined(separator: ",")]
        for row in json {
            let values = headers.map { key -> String in
                if let value = row[key] {
                    return "\"\(value)\""
                }
                return ""
            }
            rows.append(values.joined(separator: ","))
        }
        return rows.joined(separator: "\n").data(using: .utf8) ?? Data()
    }
    
    private func markdownData(from data: DataRepresentable) throws -> Data {
        guard let json = try JSONSerialization.jsonObject(with: data.encode()) as? [[String: Any]] else {
            return Data()
        }
        var markdown = "# Export\n\n"
        for entry in json {
            markdown.append("## Item\n")
            entry.forEach { key, value in
                markdown.append("- **\(key)**: \(value)\n")
            }
            markdown.append("\n")
        }
        return markdown.data(using: .utf8) ?? Data()
    }
}


