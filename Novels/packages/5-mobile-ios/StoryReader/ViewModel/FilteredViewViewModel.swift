import Foundation
import Combine
import SwiftUI

// FilteredView ViewModel - Dynamic query views
class FilteredViewViewModel: ObservableObject {
    @Published var filteredViews: [FilteredView] = []
    @Published var currentView: FilteredView?
    @Published var filteredResults: [LibraryItem] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = FilteredViewRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadFilteredViews(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getFilteredViews(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] views in
                    self?.filteredViews = views
                }
            )
            .store(in: &cancellables)
    }
    
    func createFilteredView(userId: String, name: String, description: String?, query: FilterQuery, isAutoUpdating: Bool) {
        repository.createFilteredView(userId: userId, name: name, description: description, query: query, isAutoUpdating: isAutoUpdating)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newView in
                    self?.filteredViews.append(newView)
                }
            )
            .store(in: &cancellables)
    }
    
    func updateFilteredView(userId: String, viewId: String, name: String?, query: FilterQuery?) {
        repository.updateFilteredView(userId: userId, viewId: viewId, name: name, query: query)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] updatedView in
                    if let index = self?.filteredViews.firstIndex(where: { $0.id == updatedView.id }) {
                        self?.filteredViews[index] = updatedView
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func deleteFilteredView(userId: String, viewId: String) {
        repository.deleteFilteredView(userId: userId, viewId: viewId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Remove from local array
                        self?.filteredViews.removeAll { $0.id == viewId }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func executeFilter(userId: String, query: FilterQuery) {
        isLoading = true
        errorMessage = nil
        
        repository.executeFilter(userId: userId, query: query)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] results in
                    self?.filteredResults = results
                }
            )
            .store(in: &cancellables)
    }
}


