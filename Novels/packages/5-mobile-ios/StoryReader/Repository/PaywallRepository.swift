import Foundation
import Combine

// Paywall Repository - Paywall logic
class PaywallRepository {
    private let graphQLService = GraphQLService.shared
    
    func getPaywallInfo(storyId: String, userId: String) -> AnyPublisher<PaywallViewModel.PaywallInfo, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let info = try await self.graphQLService.getPaywallInfo(storyId: storyId, userId: userId)
                    promise(.success(info))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func purchaseChapter(chapterId: String, userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.purchaseChapter(chapterId: chapterId, userId: userId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func purchaseBulk(chapterIds: [String], userId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.purchaseBulk(chapterIds: chapterIds, userId: userId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


