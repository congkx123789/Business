import Foundation
import Combine

class AuthorSupportViewModel: ObservableObject {
    @Published var stats: AuthorSupportStats?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = AuthorSupportRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadStats(authorId: String) {
        isLoading = true
        repository.getAuthorSupport(authorId: authorId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] stats in
                    self?.stats = stats
                }
            )
            .store(in: &cancellables)
    }
}


