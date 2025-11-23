import SwiftUI

struct QuizCardView: View {
    let quiz: Quiz
    let onStart: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(quiz.title)
                .font(.headline)
            if let description = quiz.description {
                Text(description)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
            HStack(spacing: 12) {
                if let duration = quiz.durationSeconds {
                    Label("\(duration / 60) min", systemImage: "clock")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                if let reward = quiz.reward {
                    Label("\(reward) pts", systemImage: "gift")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            Button("Start Quiz", action: onStart)
                .buttonStyle(.borderedProminent)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.04), radius: 4, x: 0, y: 2)
    }
}


