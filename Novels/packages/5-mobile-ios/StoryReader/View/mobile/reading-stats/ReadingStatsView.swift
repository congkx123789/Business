import SwiftUI

// Reading Stats View - Dashboard for reading analytics
struct ReadingStatsView: View {
    @StateObject private var viewModel = ReadingStatsViewModel()
    
    let userId: String
    
    var body: some View {
        VStack {
            if let stats = viewModel.stats {
                ScrollView {
                    VStack(spacing: 16) {
                        statSummary(stats)
                        ReadingTimeChart(dailyStats: stats.weeklyStats)
                        WPMTracker(wordsPerMinute: stats.wordsPerMinute)
                        ProgressChart(dailyStats: stats.monthlyStats)
                    }
                    .padding()
                }
            } else if viewModel.isLoading {
                ProgressView("Loading statistics…")
            } else {
                Text("No stats available yet.")
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Reading Stats")
        .task {
            viewModel.loadStats(userId: userId)
        }
    }
    
    private func statSummary(_ stats: ReadingStatsViewModel.ReadingStats) -> some View {
        VStack(spacing: 12) {
            HStack {
                StatCard(title: "Reading Time", value: format(time: stats.totalReadingTime), icon: "clock")
                StatCard(title: "Chapters", value: "\(stats.chaptersCompleted)", icon: "text.book.closed")
            }
            HStack {
                StatCard(title: "Stories", value: "\(stats.storiesCompleted)", icon: "book")
                StatCard(title: "Streak", value: "\(stats.readingStreak) days", icon: "flame")
            }
        }
    }
    
    private func format(time: TimeInterval) -> String {
        let hours = Int(time) / 3600
        let minutes = (Int(time) % 3600) / 60
        return "\(hours)h \(minutes)m"
    }
}

private struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: icon)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.title3)
                .fontWeight(.semibold)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}


