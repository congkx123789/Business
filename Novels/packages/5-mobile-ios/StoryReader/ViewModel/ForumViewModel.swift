import Foundation
import Combine

class ForumViewModel: ObservableObject {
    @Published var threads: [ForumThread] = []
    @Published var selectedCategory: String?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = ForumsRepository()
    private var cancellables = Set<AnyCancellable>()
    private var currentPage = 1
    private var hasMore = true
    private var storyId: String?
    
    func loadThreads(storyId: String, reset: Bool = true) {
        if reset {
            self.storyId = storyId
            currentPage = 1
            hasMore = true
            threads.removeAll()
        }
        
        guard hasMore else { return }
        
        isLoading = true
        repository
            .getThreads(storyId: storyId, category: selectedCategory, page: currentPage)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] newThreads in
                    guard let self else { return }
                    self.threads.append(contentsOf: newThreads)
                    self.hasMore = !newThreads.isEmpty
                    if !newThreads.isEmpty {
                        self.currentPage += 1
                    }
                }
            )
            .store(in: &cancellables)
    }
    
    func createThread(storyId: String, title: String, category: String, content: String) {
        let input = ForumThreadInput(storyId: storyId, title: title, category: category, content: content)
        repository.createThread(input)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] thread in
                    self?.threads.insert(thread, at: 0)
                }
            )
            .store(in: &cancellables)
    }
    
    func reply(to threadId: String, content: String) {
        let input = ForumPostInput(threadId: threadId, content: content)
        repository.replyToThread(input)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { _ in
                    // No-op; detail view handles updates via combine binding
                }
            )
            .store(in: &cancellables)
    }
    
    func changeCategory(_ category: String?) {
        selectedCategory = category
        if let storyId = storyId {
            loadThreads(storyId: storyId)
        }
    }
}


