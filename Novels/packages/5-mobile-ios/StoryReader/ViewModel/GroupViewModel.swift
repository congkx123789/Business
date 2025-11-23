import Foundation
import Combine
import SwiftUI

// Group ViewModel - Group management
class GroupViewModel: ObservableObject {
    @Published var groups: [Group] = []
    @Published var selectedGroup: Group?
    @Published var groupMembers: [User] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = GroupRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadGroups(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getGroups(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] groups in
                    self?.groups = groups
                }
            )
            .store(in: &cancellables)
    }
    
    func createGroup(userId: String, name: String, description: String?, type: Group.GroupType, isPublic: Bool) {
        repository.createGroup(userId: userId, name: name, description: description, type: type, isPublic: isPublic)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newGroup in
                    self?.groups.append(newGroup)
                }
            )
            .store(in: &cancellables)
    }
    
    func joinGroup(userId: String, groupId: String) {
        repository.joinGroup(userId: userId, groupId: groupId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] _ in
                    // Reload groups
                    self?.loadGroups(userId: userId)
                }
            )
            .store(in: &cancellables)
    }
    
    func loadGroupMembers(groupId: String) {
        repository.getGroupMembers(groupId: groupId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] members in
                    self?.groupMembers = members
                }
            )
            .store(in: &cancellables)
    }
}


