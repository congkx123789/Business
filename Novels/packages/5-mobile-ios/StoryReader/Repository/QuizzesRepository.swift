import Foundation
import Combine

// Quizzes Repository - Platform interactions: quizzes
class QuizzesRepository {
    private let graphQLService = GraphQLService.shared
    private let cache = InMemoryCache<String, [Quiz]>(expirationInterval: 60 * 5)
    
    func getQuizzes(storyId: String) -> AnyPublisher<[Quiz], Error> {
        if let cached = cache.value(forKey: storyId) {
            return Just(cached)
                .setFailureType(to: Error.self)
                .eraseToAnyPublisher()
        }
        
        return graphQLService.getQuizzes(storyId: storyId)
            .handleEvents(receiveOutput: { [weak self] quizzes in
                self?.cache.insert(quizzes, forKey: storyId)
            })
            .eraseToAnyPublisher()
    }
    
    func submitQuiz(_ input: QuizSubmissionInput) -> AnyPublisher<QuizSubmissionResult, Error> {
        graphQLService.submitQuiz(input: input)
    }
}


