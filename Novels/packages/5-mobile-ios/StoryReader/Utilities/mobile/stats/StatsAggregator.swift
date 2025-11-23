import Foundation

/// Aggregates stats for weekly / monthly charts
final class StatsAggregator {
    private let storage = StatsStorage()
    private let calculator = ReadingStatsCalculator()
    
    func aggregatedStats() -> ReadingStatsViewModel.ReadingStats {
        let sessions = storage.load()
        return calculator.calculate(sessions: sessions)
    }
}


