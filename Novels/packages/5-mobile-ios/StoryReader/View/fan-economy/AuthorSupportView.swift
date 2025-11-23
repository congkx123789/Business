import SwiftUI

struct AuthorSupportView: View {
    let authorId: String
    @StateObject private var viewModel = AuthorSupportViewModel()
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Author Support")
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
            
            if let stats = viewModel.stats {
                HStack {
                    SupportStatCard(title: "Supporters", value: "\(stats.totalSupporters)")
                    SupportStatCard(title: "Tips", value: "\(stats.totalTips)")
                    SupportStatCard(title: "Votes", value: "\(stats.totalVotes)")
                }
                
                Text("Growth: \(String(format: "%.1f", stats.growthRate * 100))%")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                if !stats.supporterBreakdown.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Supporter tiers")
                            .font(.headline)
                        ForEach(stats.supporterBreakdown) { tier in
                            HStack {
                                Text(tier.name)
                                Spacer()
                                Text("\(Int(tier.percentage * 100))%")
                            }
                            .font(.caption)
                            .padding(.vertical, 2)
                        }
                    }
                }
            } else if !viewModel.isLoading {
                Text("No author stats available.")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear {
            viewModel.loadStats(authorId: authorId)
        }
    }
}

private struct SupportStatCard: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.headline)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
}


