import Foundation
import Combine
import SwiftUI

// Summarization ViewModel - AI summarization
class SummarizationViewModel: ObservableObject {
    @Published var summary: AnnotationSummary?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = SummarizationRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct AnnotationSummary {
        let summary: String
        let keyPoints: [String]
        let insights: [String]
    }
    
    func summarizeAnnotations(userId: String, annotationIds: [String], highlights: [String], context: String? = nil) {
        isLoading = true
        errorMessage = nil
        
        repository.summarizeAnnotations(userId: userId, annotationIds: annotationIds, highlights: highlights, context: context)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] summary in
                    self?.summary = summary
                }
            )
            .store(in: &cancellables)
    }
    
    func getAnnotationSummary(selectedText: String, surroundingText: String? = nil, context: String? = nil) {
        isLoading = true
        errorMessage = nil
        
        repository.getAnnotationSummary(selectedText: selectedText, surroundingText: surroundingText, context: context)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] summary in
                    self?.summary = summary
                }
            )
            .store(in: &cancellables)
    }
}


