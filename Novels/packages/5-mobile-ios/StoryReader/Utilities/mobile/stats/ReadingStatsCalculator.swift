import Foundation

/// Calculates key metrics from reading sessions
struct ReadingStatsCalculator {
    func calculate(sessions: [ReadingStatsViewModel.DailyStats]) -> ReadingStatsViewModel.ReadingStats {
        let totalTime = sessions.reduce(0) { $0 + $1.readingTime }
        let totalWords = sessions.reduce(0) { $0 + $1.wordsRead }
        let wpm = totalTime > 0 ? Double(totalWords) / (totalTime / 60) : 0
        return ReadingStatsViewModel.ReadingStats(
            totalReadingTime: totalTime,
            wordsPerMinute: wpm,
            totalWordsRead: totalWords,
            chaptersCompleted: sessions.reduce(0) { $0 + $1.chaptersRead },
            storiesCompleted: 0,
            averageReadingSpeed: wpm,
            readingStreak: sessions.count,
            weeklyStats: Array(sessions.prefix(7)),
            monthlyStats: sessions
        )
    }
}


