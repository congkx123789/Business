import Foundation
import Combine
import SwiftUI

// Notifications ViewModel - Notifications
class NotificationsViewModel: ObservableObject {
    @Published var notifications: [Notification] = []
    @Published var unreadCount: Int = 0
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = NotificationsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadNotifications(userId: String) {
        isLoading = true
        errorMessage = nil
        
        repository.getNotifications(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] notifications in
                    self?.notifications = notifications
                    self?.unreadCount = notifications.filter { !$0.isRead }.count
                }
            )
            .store(in: &cancellables)
    }
    
    func markAsRead(notificationId: String, userId: String) {
        repository.markAsRead(notificationId: notificationId, userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Update local notification
                        if let index = self?.notifications.firstIndex(where: { $0.id == notificationId }) {
                            var updated = self?.notifications[index]
                            updated?.isRead = true
                            updated?.readAt = Date()
                            self?.notifications[index] = updated!
                            self?.unreadCount = max(0, (self?.unreadCount ?? 0) - 1)
                        }
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
    
    func markAllAsRead(userId: String) {
        repository.markAllAsRead(userId: userId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    } else {
                        // Update all notifications
                        for index in 0..<(self?.notifications.count ?? 0) {
                            self?.notifications[index].isRead = true
                            self?.notifications[index].readAt = Date()
                        }
                        self?.unreadCount = 0
                    }
                },
                receiveValue: { _ in }
            )
            .store(in: &cancellables)
    }
}


