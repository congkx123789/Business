import Foundation
import Combine
import SwiftUI

// Reading Stats ViewModel - Reading statistics
class ReadingStatsViewModel: ObservableObject {
    @Published var stats: ReadingStats?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = ReadingStatsRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct ReadingStats {
        let totalReadingTime: TimeInterval // In seconds
        let wordsPerMinute: Double
        let totalWordsRead: Int
        let chaptersCompleted: Int
        let storiesCompleted: Int
        let averageReadingSpeed: Double
        let readingStreak: Int
        let weeklyStats: [DailyStats]
        let monthlyStats: [DailyStats]
    }
    
    struct DailyStats {
        let date: Date
        let readingTime: TimeInterval
        let wordsRead: Int
        let chaptersRead: Int
    }
    
    func loadStats(userId: String, timeRange: TimeRange = .monthly) {
        isLoading = true
        errorMessage = nil
        
        repository.getReadingStats(userId: userId, timeRange: timeRange)
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
    
    enum TimeRange {
        case weekly
        case monthly
        case yearly
        case allTime
    }
}


