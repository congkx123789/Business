import Foundation
import CoreSpotlight
import UniformTypeIdentifiers

/// Handles CoreSpotlight indexing for quick search
final class SearchIndexManager {
    func index(libraryItems: [LibraryItem]) {
        let searchableItems = libraryItems.map { item -> CSSearchableItem in
            let attributeSet = CSSearchableItemAttributeSet(contentType: .text)
            attributeSet.title = item.storyId
            attributeSet.contentDescription = "Reading progress: \(Int((item.readingProgress ?? 0) * 100))%"
            return CSSearchableItem(uniqueIdentifier: item.id, domainIdentifier: "library", attributeSet: attributeSet)
        }
        CSSearchableIndex.default().indexSearchableItems(searchableItems) { error in
            if let error {
                print("Indexing failed: \(error)")
            }
        }
    }
    
    func deleteAll() {
        CSSearchableIndex.default().deleteAllSearchableItems { error in
            if let error {
                print("Failed to delete index: \(error)")
            }
        }
    }
}


