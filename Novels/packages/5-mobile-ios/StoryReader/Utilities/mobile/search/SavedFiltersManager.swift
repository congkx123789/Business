import Foundation

/// Bridges filter presets to Core Data for sync
final class SavedFiltersManager {
    private let offlineService = OfflineService()
    
    func save(filter: FilterQuery, name: String) {
        // Placeholder: Persist to Core Data entity when model exists.
        UserDefaults.standard.set(name, forKey: "lastFilterName")
    }
}


