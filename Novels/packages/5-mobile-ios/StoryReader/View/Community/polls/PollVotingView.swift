import SwiftUI

struct PollVotingView: View {
    let poll: Poll
    let onVote: (String) -> Void
    
    var body: some View {
        VStack(spacing: 8) {
            ForEach(poll.options) { option in
                Button(action: {
                    guard poll.userVoteOptionId == nil else { return }
                    onVote(option.id)
                }) {
                    HStack {
                        Text(option.text)
                        Spacer()
                        if poll.userVoteOptionId == option.id {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                        }
                    }
                    .padding()
                    .background(Color(.secondarySystemBackground))
                    .cornerRadius(10)
                }
                .disabled(poll.userVoteOptionId != nil)
            }
        }
    }
}

struct PollResultsView: View {
    let options: [PollOption]
    let totalVotes: Int
    let userVoteOptionId: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ForEach(options) { option in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(option.text)
                        Spacer()
                        Text("\(option.voteCount) votes")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(Color.gray.opacity(0.2))
                                .frame(height: 6)
                            Capsule()
                                .fill(option.id == userVoteOptionId ? Color.blue : Color.gray.opacity(0.5))
                                .frame(width: geo.size.width * CGFloat(option.percentage / 100.0), height: 6)
                        }
                    }
                    .frame(height: 6)
                }
            }
            Text("Total votes: \(totalVotes)")
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}


