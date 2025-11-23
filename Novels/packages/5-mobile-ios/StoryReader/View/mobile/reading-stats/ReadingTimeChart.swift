import SwiftUI

// Reading Time Chart - Simple bar chart for weekly stats
struct ReadingTimeChart: View {
    let dailyStats: [ReadingStatsViewModel.DailyStats]
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Weekly Reading Time")
                .font(.headline)
            HStack(alignment: .bottom, spacing: 12) {
                ForEach(dailyStats, id: \.date) { stat in
                    VStack {
                        Rectangle()
                            .fill(Color.accentColor.opacity(0.7))
                            .frame(height: barHeight(for: stat.readingTime))
                        Text(stat.date, format: .dateTime.weekday(.abbreviated))
                            .font(.caption2)
                    }
                }
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    private func barHeight(for time: TimeInterval) -> CGFloat {
        let maxTime = (dailyStats.map { $0.readingTime }.max() ?? 1)
        let ratio = time / maxTime
        return CGFloat(ratio) * 120
    }
}


