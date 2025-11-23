import SwiftUI

struct PollCardView: View {
    let poll: Poll
    let onVote: (String) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(poll.question)
                .font(.headline)
            
            PollVotingView(
                poll: poll,
                onVote: onVote
            )
            
            PollResultsView(options: poll.options, totalVotes: poll.totalVotes, userVoteOptionId: poll.userVoteOptionId)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.04), radius: 3, x: 0, y: 1)
    }
}


