import SwiftUI

struct QuizInterfaceView: View {
    let quiz: Quiz
    let isSubmitting: Bool
    let onSubmit: ([String: String]) -> Void
    let submissionResult: QuizSubmissionResult?
    
    @State private var answers: [String: String] = [:]
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    Text(quiz.title)
                        .font(.title)
                        .fontWeight(.bold)
                    
                    if let description = quiz.description {
                        Text(description)
                            .foregroundColor(.secondary)
                    }
                    
                    ForEach(quiz.questions) { question in
                        VStack(alignment: .leading, spacing: 12) {
                            Text(question.prompt)
                                .font(.headline)
                            
                            ForEach(question.options) { option in
                                HStack {
                                    Image(systemName: answers[question.id] == option.id ? "largecircle.fill.circle" : "circle")
                                    Text(option.text)
                                        .frame(maxWidth: .infinity, alignment: .leading)
                                }
                                .padding()
                                .background(Color(.secondarySystemBackground))
                                .cornerRadius(10)
                                .onTapGesture {
                                    answers[question.id] = option.id
                                }
                            }
                        }
                    }
                    
                    if isSubmitting {
                        ProgressView("Submitting...")
                    } else {
                        Button("Submit Quiz") {
                            onSubmit(answers)
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(answers.keys.count != quiz.questions.count)
                    }
                    
                    if let result = submissionResult {
                        QuizResultsView(result: result)
                        if let leaderboard = quiz.leaderboard {
                            QuizLeaderboardView(entries: leaderboard)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Quiz")
        }
    }
}


