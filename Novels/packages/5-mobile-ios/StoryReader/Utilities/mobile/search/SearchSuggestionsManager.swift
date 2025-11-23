import Foundation

/// Builds real-time suggestions based on history + trending topics
final class SearchSuggestionsManager {
    private let historyManager = SearchHistoryManager()
    
    func suggestions(for query: String) -> [String] {
        guard !query.isEmpty else { return [] }
        let history = historyManager.load()
        let matchingHistory = history.filter { $0.localizedCaseInsensitiveContains(query) }
        let trending = ["Daily Missions", "Power Stones", "Privilege"].filter {
            $0.localizedCaseInsensitiveContains(query)
        }
        return Array(Set(matchingHistory + trending)).prefix(6).map { $0 }
    }
}


