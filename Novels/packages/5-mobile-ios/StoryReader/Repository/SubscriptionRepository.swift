import Foundation
import Combine

// Subscription Repository - Subscription logic
class SubscriptionRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func getSubscription(userId: String) -> AnyPublisher<Subscription?, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let subscription = try await self.graphQLService.getSubscription(userId: userId)
                    // Cache in Core Data
                    if let subscription = subscription {
                        try? self.offlineService.saveSubscription(subscription)
                    }
                    promise(.success(subscription))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getPlans() -> AnyPublisher<[MembershipPlan], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let plans = try await self.graphQLService.getSubscriptionPlans()
                    promise(.success(plans))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func subscribe(userId: String, planId: String) -> AnyPublisher<Subscription, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let subscription = try await self.graphQLService.subscribe(userId: userId, planId: planId)
                    // Save to Core Data
                    try? self.offlineService.saveSubscription(subscription)
                    promise(.success(subscription))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func cancelSubscription(userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.cancelSubscription(userId: userId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


