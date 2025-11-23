import Foundation
import Combine
import SwiftUI

// Bookshelf ViewModel - MVVM Pattern (Rule #5)
class BookshelfViewModel: ObservableObject {
    @Published var bookshelves: [Bookshelf] = []
    @Published var selectedBookshelf: Bookshelf?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = BookshelfRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadBookshelves(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getBookshelves(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] bookshelves in
                    self?.bookshelves = bookshelves
                }
            )
            .store(in: &cancellables)
    }
    
    func createBookshelf(userId: String, name: String, description: String? = nil) {
        repository.createBookshelf(userId: userId, name: name, description: description)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newBookshelf in
                    self?.bookshelves.append(newBookshelf)
                }
            )
            .store(in: &cancellables)
    }
    
    func updateBookshelf(userId: String, bookshelfId: String, name: String?, description: String?) {
        repository.updateBookshelf(userId: userId, bookshelfId: bookshelfId, name: name, description: description)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] updatedBookshelf in
                    if let index = self?.bookshelves.firstIndex(where: { $0.id == updatedBookshelf.id }) {
                        self?.bookshelves[index] = updatedBookshelf
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func deleteBookshelf(userId: String, bookshelfId: String) {
        repository.deleteBookshelf(userId: userId, bookshelfId: bookshelfId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Remove from local array
                        self?.bookshelves.removeAll { $0.id == bookshelfId }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func addToBookshelf(userId: String, bookshelfId: String, libraryId: String) {
        repository.addToBookshelf(userId: userId, bookshelfId: bookshelfId, libraryId: libraryId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    // Reload bookshelves to get updated items
                    self?.loadBookshelves(userId: userId)
                }
            )
            .store(in: &cancellables)
    }
    
    func removeFromBookshelf(userId: String, bookshelfId: String, libraryId: String) {
        repository.removeFromBookshelf(userId: userId, bookshelfId: bookshelfId, libraryId: libraryId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    // Reload bookshelves to get updated items
                    self?.loadBookshelves(userId: userId)
                }
            )
            .store(in: &cancellables)
    }
}


