import SwiftUI

struct QuizResultsView: View {
    let result: QuizSubmissionResult
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Results")
                .font(.headline)
            HStack {
                Text("Score: \(result.score)")
                Spacer()
                Text("Correct: \(result.correctCount)/\(result.totalQuestions)")
            }
            if let reward = result.rewardEarned {
                Label("\(reward) points earned", systemImage: "gift.fill")
                    .foregroundColor(.orange)
            }
            if let rank = result.leaderboardRank {
                Text("Leaderboard Rank: #\(rank)")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(12)
    }
}

struct QuizLeaderboardView: View {
    let entries: [QuizLeaderboardEntry]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Leaderboard")
                .font(.headline)
            ForEach(entries) { entry in
                HStack {
                    Text("#\(entry.rank)")
                        .fontWeight(entry.rank == 1 ? .bold : .regular)
                    Text(entry.username)
                    Spacer()
                    Text("\(entry.score)")
                }
                .padding(.vertical, 4)
            }
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .cornerRadius(12)
    }
}


