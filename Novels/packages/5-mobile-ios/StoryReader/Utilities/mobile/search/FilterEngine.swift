import Foundation

/// Applies FilterQuery locally (offline-first)
struct FilterEngine {
    private let builder = QueryBuilder()
    
    func apply(filter: FilterQuery, to items: [LibraryItem]) -> [LibraryItem] {
        guard let predicate = builder.predicate(from: filter) else { return items }
        return items.filter { item in
            predicate.evaluate(with: ItemProxy(item: item))
        }
    }
    
    private struct ItemProxy: NSObject {
        let storyId: String
        let isCompleted: Bool
        let readingProgress: Double
        let authorId: String
        
        init(item: LibraryItem) {
            self.storyId = item.storyId
            self.isCompleted = item.isCompleted
            self.readingProgress = item.readingProgress ?? 0
            self.authorId = "" // Future: fetch from stories cache
        }
    }
}


