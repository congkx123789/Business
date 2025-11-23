import Foundation
import Combine
import SwiftUI

// Tags ViewModel - Tag management
class TagsViewModel: ObservableObject {
    @Published var tags: [Tag] = []
    @Published var selectedTags: Set<String> = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = TagRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadTags(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getTags(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] tags in
                    self?.tags = tags
                }
            )
            .store(in: &cancellables)
    }
    
    func createTag(userId: String, name: String, color: String?, icon: String?, parentTagId: String?) {
        repository.createTag(userId: userId, name: name, color: color, icon: icon, parentTagId: parentTagId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newTag in
                    self?.tags.append(newTag)
                }
            )
            .store(in: &cancellables)
    }
    
    func updateTag(userId: String, tagId: String, name: String?, color: String?, icon: String?) {
        repository.updateTag(userId: userId, tagId: tagId, name: name, color: color, icon: icon)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] updatedTag in
                    if let index = self?.tags.firstIndex(where: { $0.id == updatedTag.id }) {
                        self?.tags[index] = updatedTag
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func deleteTag(userId: String, tagId: String) {
        repository.deleteTag(userId: userId, tagId: tagId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Remove from local array
                        self?.tags.removeAll { $0.id == tagId }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func applyTagToLibrary(userId: String, libraryId: String, tagId: String) {
        repository.applyTagToLibrary(userId: userId, libraryId: libraryId, tagId: tagId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}


