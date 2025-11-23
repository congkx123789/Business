import Foundation
import Combine
import SwiftUI

// Advanced Search ViewModel - Advanced search/filter
class AdvancedSearchViewModel: ObservableObject {
    @Published var searchResults: [LibraryItem] = []
    @Published var searchHistory: [String] = []
    @Published var searchSuggestions: [String] = []
    @Published var filterPresets: [FilterPreset] = []
    @Published var currentQuery: String = ""
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = SearchRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct FilterPreset {
        let id: String
        let name: String
        let query: FilterQuery
        let createdAt: Date
    }
    
    func search(query: String, filters: FilterQuery? = nil) {
        currentQuery = query
        isLoading = true
        errorMessage = nil
        
        // Add to search history
        if !query.isEmpty {
            addToSearchHistory(query)
        }
        
        repository.search(query: query, filters: filters)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] results in
                    self?.searchResults = results
                }
            )
            .store(in: &cancellables)
    }
    
    func loadSearchHistory() {
        repository.getSearchHistory()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] history in
                    self?.searchHistory = history
                }
            )
            .store(in: &cancellables)
    }
    
    func getSearchSuggestions(query: String) {
        repository.getSearchSuggestions(query: query)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        // Don't show error for suggestions
                    }
                },
                receiveValue: { [weak self] suggestions in
                    self?.searchSuggestions = suggestions
                }
            )
            .store(in: &cancellables)
    }
    
    func loadFilterPresets() {
        repository.getFilterPresets()
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] presets in
                    self?.filterPresets = presets
                }
            )
            .store(in: &cancellables)
    }
    
    func saveFilterPreset(name: String, query: FilterQuery) {
        repository.saveFilterPreset(name: name, query: query)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Reload presets
                        self?.loadFilterPresets()
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    private func addToSearchHistory(_ query: String) {
        // Remove if already exists
        searchHistory.removeAll { $0 == query }
        // Add to beginning
        searchHistory.insert(query, at: 0)
        // Limit to 50 items
        if searchHistory.count > 50 {
            searchHistory = Array(searchHistory.prefix(50))
        }
        // Save to Core Data
        repository.saveSearchHistory(searchHistory)
    }
}


