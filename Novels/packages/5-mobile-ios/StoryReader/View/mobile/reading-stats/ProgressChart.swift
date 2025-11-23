import SwiftUI

// Progress Chart - Shows monthly progress trend
struct ProgressChart: View {
    let dailyStats: [ReadingStatsViewModel.DailyStats]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Monthly Progress")
                .font(.headline)
            GeometryReader { geometry in
                Path { path in
                    guard let first = dailyStats.first else { return }
                    let maxWords = max(dailyStats.map { Double($0.wordsRead) }.max() ?? 1, 1)
                    let width = geometry.size.width / CGFloat(max(dailyStats.count - 1, 1))
                    
                    path.move(to: CGPoint(x: 0, y: yPosition(for: first.wordsRead, height: geometry.size.height, max: maxWords)))
                    
                    for (index, stat) in dailyStats.enumerated() {
                        let x = CGFloat(index) * width
                        let y = yPosition(for: stat.wordsRead, height: geometry.size.height, max: maxWords)
                        path.addLine(to: CGPoint(x: x, y: y))
                    }
                }
                .stroke(Color.purple, lineWidth: 2)
            }
            .frame(height: 120)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
    
    private func yPosition(for value: Int, height: CGFloat, max: Double) -> CGFloat {
        let ratio = Double(value) / max
        return height - CGFloat(ratio) * height
    }
}


