import Foundation
import Combine

class PollsViewModel: ObservableObject {
    @Published var polls: [Poll] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = PollsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    func loadPolls(storyId: String) {
        isLoading = true
        repository.getPolls(storyId: storyId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] polls in
                    self?.polls = polls
                }
            )
            .store(in: &cancellables)
    }
    
    func vote(pollId: String, optionId: String) {
        repository.votePoll(pollId: pollId, optionId: optionId)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] result in
                    guard let index = self?.polls.firstIndex(where: { $0.id == result.pollId }) else { return }
                    var poll = self?.polls[index]
                    poll?.options = result.options
                    poll?.totalVotes = result.totalVotes
                    poll?.userVoteOptionId = result.optionId
                    if let updated = poll {
                        self?.polls[index] = updated
                    }
                }
            )
            .store(in: &cancellables)
    }
}


