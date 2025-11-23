import Foundation
import Combine

// Summarization Repository - Summarization logic
class SummarizationRepository {
    private let graphQLService = GraphQLService.shared
    
    func summarizeAnnotations(userId: String, annotationIds: [String], highlights: [String], context: String? = nil) -> AnyPublisher<SummarizationViewModel.AnnotationSummary, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let summary = try await self.graphQLService.summarizeAnnotations(userId: userId, annotationIds: annotationIds, highlights: highlights, context: context)
                    promise(.success(summary))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getAnnotationSummary(selectedText: String, surroundingText: String? = nil, context: String? = nil) -> AnyPublisher<SummarizationViewModel.AnnotationSummary, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let summary = try await self.graphQLService.getAnnotationSummary(selectedText: selectedText, surroundingText: surroundingText, context: context)
                    promise(.success(summary))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


