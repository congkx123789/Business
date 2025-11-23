import Foundation
import Combine
import SwiftUI

// Export/Import ViewModel - Export/Import features
class ExportImportViewModel: ObservableObject {
    @Published var exportHistory: [ExportRecord] = []
    @Published var isExporting: Bool = false
    @Published var isImporting: Bool = false
    @Published var exportProgress: Double = 0.0
    @Published var errorMessage: String?
    @Published var exportSuccess: Bool = false
    
    private let repository = ExportImportRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct ExportRecord {
        let id: String
        let format: ExportFormat
        let scope: ExportScope
        let itemCount: Int
        let fileSize: Int64
        let exportedAt: Date
        let filePath: String?
    }
    
    enum ExportFormat: String, CaseIterable {
        case json = "JSON"
        case csv = "CSV"
        case markdown = "Markdown"
        case pdf = "PDF"
    }
    
    enum ExportScope {
        case library
        case annotations
        case readingProgress
        case all
    }
    
    func export(userId: String, format: ExportFormat, scope: ExportScope, itemIds: [String]? = nil) {
        isExporting = true
        exportProgress = 0.0
        errorMessage = nil
        exportSuccess = false
        
        repository.export(userId: userId, format: format, scope: scope, itemIds: itemIds)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isExporting = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] record in
                    self?.exportSuccess = true
                    self?.exportHistory.insert(record, at: 0) // Add to beginning
                    self?.exportProgress = 1.0
                }
            )
            .store(in: &cancellables)
    }
    
    func loadExportHistory(userId: String) {
        repository.getExportHistory(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] history in
                    self?.exportHistory = history
                }
            )
            .store(in: &cancellables)
    }
    
    func importData(userId: String, filePath: String, format: ExportFormat) {
        isImporting = true
        errorMessage = nil
        
        repository.importData(userId: userId, filePath: filePath, format: format)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isImporting = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}


