import Foundation

// Bulk Operation Manager - Manages bulk operations
class BulkOperationManager {
    static let shared = BulkOperationManager()
    
    private var activeOperations: [String: BulkOperation] = [:]
    
    struct BulkOperation {
        let id: String
        let type: OperationType
        let itemIds: [String]
        let status: OperationStatus
        let progress: Double
        let createdAt: Date
    }
    
    enum OperationType {
        case delete
        case moveToBookshelf
        case applyTags
        case export
    }
    
    enum OperationStatus {
        case pending
        case inProgress
        case completed
        case failed
    }
    
    func startOperation(type: OperationType, itemIds: [String]) -> String {
        let operationId = UUID().uuidString
        let operation = BulkOperation(
            id: operationId,
            type: type,
            itemIds: itemIds,
            status: .pending,
            progress: 0.0,
            createdAt: Date()
        )
        activeOperations[operationId] = operation
        return operationId
    }
    
    func updateOperation(operationId: String, status: OperationStatus, progress: Double) {
        guard var operation = activeOperations[operationId] else { return }
        operation = BulkOperation(
            id: operation.id,
            type: operation.type,
            itemIds: operation.itemIds,
            status: status,
            progress: progress,
            createdAt: operation.createdAt
        )
        activeOperations[operationId] = operation
    }
    
    func getOperation(operationId: String) -> BulkOperation? {
        return activeOperations[operationId]
    }
    
    func removeOperation(operationId: String) {
        activeOperations.removeValue(forKey: operationId)
    }
}


