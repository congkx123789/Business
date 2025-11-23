import Foundation
import Combine
import SwiftUI

// Translation ViewModel - Translation functionality
class TranslationViewModel: ObservableObject {
    @Published var translation: Translation?
    @Published var parallelTranslation: ParallelTranslation?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = TranslationRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func translateText(text: String, fromLang: String, toLang: String, context: TranslationContext? = nil) {
        isLoading = true
        errorMessage = nil
        
        repository.translateText(text: text, fromLang: fromLang, toLang: toLang, context: context)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] translation in
                    self?.translation = translation
                }
            )
            .store(in: &cancellables)
    }
    
    func translateSentence(sentence: String, fromLang: String, toLang: String, context: String? = nil) {
        isLoading = true
        errorMessage = nil
        
        repository.translateSentence(sentence: sentence, fromLang: fromLang, toLang: toLang, context: context)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] translation in
                    self?.translation = translation
                }
            )
            .store(in: &cancellables)
    }
    
    func getParallelTranslation(text: String, fromLang: String, toLang: String, displayMode: ParallelTranslation.ParallelDisplayMode) {
        isLoading = true
        errorMessage = nil
        
        repository.getParallelTranslation(text: text, fromLang: fromLang, toLang: toLang, displayMode: displayMode)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] parallelTranslation in
                    self?.parallelTranslation = parallelTranslation
                }
            )
            .store(in: &cancellables)
    }
}


