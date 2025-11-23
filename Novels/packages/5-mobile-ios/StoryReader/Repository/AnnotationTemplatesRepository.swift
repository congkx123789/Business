import Foundation
import Combine

// Annotation Templates Repository
class AnnotationTemplatesRepository {
    private let offlineService = OfflineService()
    private let graphQLService = GraphQLService.shared
    
    func getTemplates(userId: String) -> AnyPublisher<[AnnotationTemplatesViewModel.AnnotationTemplate], Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            do {
                // Load from Core Data first
                let localTemplates = try self.offlineService.getAnnotationTemplates(userId: userId)
                promise(.success(localTemplates))
                
                // Sync from network in background
                Task {
                    do {
                        let remoteTemplates = try await self.graphQLService.getAnnotationTemplates(userId: userId)
                        try? self.offlineService.saveAnnotationTemplates(remoteTemplates)
                    } catch {
                        print("Annotation templates sync failed: \(error)")
                    }
                }
            } catch {
                promise(.failure(error))
            }
        }
        .eraseToAnyPublisher()
    }
    
    func createTemplate(userId: String, name: String, format: AnnotationTemplatesViewModel.AnnotationFormat, color: String?, tags: [String]) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let template = try await self.graphQLService.createAnnotationTemplate(userId: userId, name: name, format: format, color: color, tags: tags)
                    // Save to Core Data
                    try? self.offlineService.saveAnnotationTemplate(template)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func updateTemplate(userId: String, templateId: String, name: String?, format: AnnotationTemplatesViewModel.AnnotationFormat?, color: String?, tags: [String]?) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let template = try await self.graphQLService.updateAnnotationTemplate(userId: userId, templateId: templateId, name: name, format: format, color: color, tags: tags)
                    // Update Core Data
                    try? self.offlineService.saveAnnotationTemplate(template)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func deleteTemplate(userId: String, templateId: String) -> AnyPublisher<Void, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    try await self.graphQLService.deleteAnnotationTemplate(userId: userId, templateId: templateId)
                    // Delete from Core Data
                    try? self.offlineService.deleteAnnotationTemplate(templateId: templateId)
                    promise(.success(()))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


