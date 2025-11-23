import SwiftUI

struct QuizListView: View {
    let storyId: String
    @StateObject private var viewModel = QuizzesViewModel()
    @State private var activeQuiz: Quiz?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Quizzes")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
            }
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if viewModel.quizzes.isEmpty {
                Text("No quizzes available right now.")
                    .foregroundColor(.secondary)
            } else {
                ForEach(viewModel.quizzes) { quiz in
                    QuizCardView(quiz: quiz) {
                        activeQuiz = quiz
                    }
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear {
            viewModel.loadQuizzes(storyId: storyId)
        }
        .sheet(item: $activeQuiz) { quiz in
            QuizInterfaceView(
                quiz: quiz,
                isSubmitting: viewModel.isSubmitting,
                onSubmit: { answers in
                    let input = QuizSubmissionInput(quizId: quiz.id, answers: answers)
                    viewModel.submitQuiz(input: input)
                },
                submissionResult: viewModel.submissionResult
            )
        }
    }
}


