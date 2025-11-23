import Foundation

/// Persists reading sessions locally for offline analytics
final class StatsStorage {
    private let key = "readingSessions"
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    
    func save(sessions: [ReadingStatsViewModel.DailyStats]) {
        if let data = try? encoder.encode(sessions.map(SerializableDailyStats.init)) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
    
    func load() -> [ReadingStatsViewModel.DailyStats] {
        guard
            let data = UserDefaults.standard.data(forKey: key),
            let serializable = try? decoder.decode([SerializableDailyStats].self, from: data)
        else {
            return []
        }
        return serializable.map { $0.model }
    }
    
    private struct SerializableDailyStats: Codable {
        let date: Date
        let readingTime: TimeInterval
        let wordsRead: Int
        let chaptersRead: Int
        
        init(model: ReadingStatsViewModel.DailyStats) {
            self.date = model.date
            self.readingTime = model.readingTime
            self.wordsRead = model.wordsRead
            self.chaptersRead = model.chaptersRead
        }
        
        var model: ReadingStatsViewModel.DailyStats {
            ReadingStatsViewModel.DailyStats(date: date, readingTime: readingTime, wordsRead: wordsRead, chaptersRead: chaptersRead)
        }
    }
}


