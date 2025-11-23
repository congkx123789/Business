import Foundation
import Combine

// Export/Import Repository - Export/Import logic
class ExportImportRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func export(userId: String, format: ExportImportViewModel.ExportFormat, scope: ExportImportViewModel.ExportScope, itemIds: [String]?) -> AnyPublisher<ExportImportViewModel.ExportRecord, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    // Export from local data (Core Data)
                    let record = try await self.offlineService.exportData(userId: userId, format: format, scope: scope, itemIds: itemIds)
                    promise(.success(record))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getExportHistory(userId: String) -> AnyPublisher<[ExportImportViewModel.ExportRecord], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                let history = try self.offlineService.getExportHistory(userId: userId)
                promise(.success(history))
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func importData(userId: String, filePath: String, format: ExportImportViewModel.ExportFormat) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.offlineService.importData(userId: userId, filePath: filePath, format: format)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


