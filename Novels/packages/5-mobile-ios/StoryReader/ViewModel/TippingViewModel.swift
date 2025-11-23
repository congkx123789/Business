import Foundation
import Combine

class TippingViewModel: ObservableObject {
    @Published var tipStats: TipStats?
    @Published var tipHistory: [Tip] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var isSubmitting: Bool = false
    @Published var lastTip: Tip?
    
    private let repository = TippingRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadData(storyId: String) {
        isLoading = true
        let statsPublisher = repository.getTipStats(storyId: storyId)
        let historyPublisher = repository.getTippingHistory(storyId: storyId, limit: 25)
        
        Publishers.Zip(statsPublisher, historyPublisher)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] stats, history in
                    self?.tipStats = stats
                    self?.tipHistory = history
                }
            )
            .store(in: &cancellables)
    }
    
    func sendTip(storyId: String, amount: Int, message: String?) {
        isSubmitting = true
        repository.createTip(storyId: storyId, amount: amount, message: message)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isSubmitting = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] tip in
                    self?.lastTip = tip
                    self?.tipHistory.insert(tip, at: 0)
                    self?.refreshStats(storyId: storyId)
                }
            )
            .store(in: &cancellables)
    }
    
    private func refreshStats(storyId: String) {
        repository.getTipStats(storyId: storyId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { _ in },
                receiveValue: { [weak self] stats in
                    self?.tipStats = stats
                }
            )
            .store(in: &cancellables)
    }
}


