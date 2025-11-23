import SwiftUI

struct PollListView: View {
    let storyId: String
    @StateObject private var viewModel = PollsViewModel()
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Polls")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if viewModel.polls.isEmpty && !viewModel.isLoading {
                Text("No polls available.")
                    .foregroundColor(.secondary)
            } else {
                ForEach(viewModel.polls) { poll in
                    PollCardView(
                        poll: poll,
                        onVote: { optionId in
                            viewModel.vote(pollId: poll.id, optionId: optionId)
                        }
                    )
                }
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear {
            viewModel.loadPolls(storyId: storyId)
        }
    }
}


