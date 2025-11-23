import Foundation
import Combine

// Translation Repository - Translation logic
class TranslationRepository {
    private let graphQLService = GraphQLService.shared
    
    func translateText(text: String, fromLang: String, toLang: String, context: TranslationContext? = nil) -> AnyPublisher<Translation, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let translation = try await self.graphQLService.translateText(text: text, fromLang: fromLang, toLang: toLang, context: context)
                    promise(.success(translation))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func translateSentence(sentence: String, fromLang: String, toLang: String, context: String? = nil) -> AnyPublisher<Translation, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let translation = try await self.graphQLService.translateSentence(sentence: sentence, fromLang: fromLang, toLang: toLang, context: context)
                    promise(.success(translation))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
    
    func getParallelTranslation(text: String, fromLang: String, toLang: String, displayMode: ParallelTranslation.ParallelDisplayMode) -> AnyPublisher<ParallelTranslation, Error> {
        return Future { [weak self] promise in
            guard let self = self else {
                promise(.failure(RepositoryError.unknown))
                return
            }
            
            Task {
                do {
                    let parallelTranslation = try await self.graphQLService.getParallelTranslation(text: text, fromLang: fromLang, toLang: toLang, displayMode: displayMode)
                    promise(.success(parallelTranslation))
                } catch {
                    promise(.failure(error))
                }
            }
        }
        .eraseToAnyPublisher()
    }
}


