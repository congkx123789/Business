import Foundation
import Combine

// Notifications Repository - Notifications logic
class NotificationsRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func getNotifications(userId: String) -> AnyPublisher<[Notification], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // 1. Load from Core Data first (instant UI)
                let localNotifications = try self.offlineService.getNotifications(userId: userId)
                promise(.success(localNotifications))
                
                // 2. Fetch from network in background
                self.graphQLService.getNotifications(userId: userId)
                    .sink(
                        receiveCompletion: { completion in
                            if case .failure(let error) = completion {
                                print("Notification sync failed: \(error)")
                            }
                        },
                        receiveValue: { remoteNotifications in
                            // Update Core Data
                            try? self.offlineService.saveNotifications(remoteNotifications)
                        }
                    )
                    .store(in: &self.cancellables)
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func markAsRead(notificationId: String, userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            self.graphQLService.markNotificationAsRead(notificationId: notificationId, userId: userId)
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            promise(.failure(error))
                        } else {
                            // Update Core Data
                            try? self.offlineService.markNotificationAsRead(notificationId: notificationId)
                            promise(.success(()))
                        }
                    },
                    receiveValue: { _ in }
                )
        }
        .eraseToAnyPublisher()
    }
    
    func markAllAsRead(userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            self.graphQLService.markAllNotificationsAsRead(userId: userId)
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            promise(.failure(error))
                        } else {
                            // Update Core Data
                            try? self.offlineService.markAllNotificationsAsRead(userId: userId)
                            promise(.success(()))
                        }
                    },
                    receiveValue: { _ in }
                )
        }
        .eraseToAnyPublisher()
    }
    
    func updateNotificationSettings(_ settings: NotificationSettings) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            self.graphQLService.updateNotificationSettings(settings: settings)
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            promise(.failure(error))
                        } else {
                            // Update Core Data
                            try? self.offlineService.saveNotificationSettings(settings)
                            promise(.success(()))
                        }
                    },
                    receiveValue: { _ in }
                )
        }
        .eraseToAnyPublisher()
    }
    
    enum RepositoryError: Error {
        case unknown
    }
}


