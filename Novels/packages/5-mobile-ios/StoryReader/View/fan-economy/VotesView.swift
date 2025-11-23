import SwiftUI

struct VotesView: View {
    let storyId: String
    @StateObject private var viewModel = VotesViewModel()
    @State private var votesToCast: String = "1"
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Monthly Votes")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            
            if let balance = viewModel.balance {
                HStack(spacing: 12) {
                    VoteBalanceCard(title: "Available", value: balance.availableVotes, color: .green)
                    VoteBalanceCard(title: "Bonus", value: balance.bonusVotes, color: .purple)
                }
            }
            
            HStack {
                TextField("Votes", text: $votesToCast)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
                Button {
                    if let votes = Int(votesToCast) {
                        viewModel.castVotes(storyId: storyId, votes: votes)
                        votesToCast = ""
                    }
                } label: {
                    if viewModel.isSubmitting {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Vote")
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(viewModel.isSubmitting || Int(votesToCast) == nil)
            }
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if !viewModel.history.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recent votes")
                        .font(.headline)
                    ForEach(viewModel.history) { item in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(item.storyTitle)
                                    .fontWeight(.semibold)
                                Text(item.createdAt, style: .relative)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            Spacer()
                            Text("-\(item.votes)")
                                .fontWeight(.bold)
                        }
                        .padding(.vertical, 4)
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
            viewModel.loadData()
        }
    }
}

private struct VoteBalanceCard: View {
    let title: String
    let value: Int
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text("\(value)")
                .font(.title2)
                .fontWeight(.bold)
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(color.opacity(0.15))
        .cornerRadius(12)
    }
}


