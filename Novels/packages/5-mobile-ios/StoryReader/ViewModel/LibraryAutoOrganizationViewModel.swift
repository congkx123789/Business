import Foundation
import Combine
import SwiftUI

// Library Auto-Organization ViewModel - Auto-grouping by author/series
class LibraryAutoOrganizationViewModel: ObservableObject {
    @Published var authorGroups: [AuthorGroup] = []
    @Published var seriesGroups: [SeriesGroup] = []
    @Published var systemLists: [SystemList] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = LibraryAutoOrganizationRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct AuthorGroup {
        let authorId: String
        let authorName: String
        let stories: [LibraryItem]
    }
    
    struct SeriesGroup {
        let seriesId: String
        let seriesName: String
        let stories: [LibraryItem]
    }
    
    func loadAuthorGroups(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getBooksByAuthor(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] groups in
                    self?.authorGroups = groups
                }
            )
            .store(in: &cancellables)
    }
    
    func loadSeriesGroups(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getBooksBySeries(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] groups in
                    self?.seriesGroups = groups
                }
            )
            .store(in: &cancellables)
    }
    
    func loadSystemLists(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getSystemLists(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] lists in
                    self?.systemLists = lists
                }
            )
            .store(in: &cancellables)
    }
}


