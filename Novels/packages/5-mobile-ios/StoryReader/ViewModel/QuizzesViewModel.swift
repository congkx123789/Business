import Foundation
import Combine

class QuizzesViewModel: ObservableObject {
    @Published var quizzes: [Quiz] = []
    @Published var isSubmitting: Bool = false
    @Published var submissionResult: QuizSubmissionResult?
    @Published var errorMessage: String?
    
    private let repository = QuizzesRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadQuizzes(storyId: String) {
        repository.getQuizzes(storyId: storyId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] quizzes in
                    self?.quizzes = quizzes
                }
            )
            .store(in: &cancellables)
    }
    
    func submitQuiz(input: QuizSubmissionInput) {
        isSubmitting = true
        submissionResult = nil
        
        repository.submitQuiz(input)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isSubmitting = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    self?.submissionResult = result
                }
            )
            .store(in: &cancellables)
    }
}


