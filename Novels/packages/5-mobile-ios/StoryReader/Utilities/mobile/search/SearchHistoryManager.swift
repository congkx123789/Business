import Foundation

/// Stores last 50 search queries locally
final class SearchHistoryManager {
    private let key = "searchHistory"
    private let limit = 50
    
    func add(_ query: String) {
        guard !query.isEmpty else { return }
        var history = load()
        history.removeAll { $0 == query }
        history.insert(query, at: 0)
        history = Array(history.prefix(limit))
        UserDefaults.standard.set(history, forKey: key)
    }
    
    func load() -> [String] {
        UserDefaults.standard.stringArray(forKey: key) ?? []
    }
    
    func clear() {
        UserDefaults.standard.removeObject(forKey: key)
    }
}


