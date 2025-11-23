import SwiftUI

struct FanRankingsView: View {
    let storyId: String
    @StateObject private var viewModel = FanRankingsViewModel()
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Fan Rankings")
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
            
            if let page = viewModel.rankingPage {
                Text("Season \(page.season) • Updated \(page.updatedAt, style: .relative)")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                ForEach(page.entries) { entry in
                    FanRankingRow(entry: entry)
                }
            } else if !viewModel.isLoading {
                Text("No ranking data yet.")
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.secondarySystemBackground))
        )
        .onAppear {
            viewModel.loadRankings(storyId: storyId)
        }
    }
}

private struct FanRankingRow: View {
    let entry: FanRankingEntry
    
    var body: some View {
        HStack(spacing: 12) {
            Text("#\(entry.rank)")
                .font(.subheadline)
                .fontWeight(entry.rank <= 3 ? .bold : .regular)
                .frame(width: 32)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.username)
                    .fontWeight(.semibold)
                Text("\(entry.contribution) pts")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
            if entry.rank == 1 {
                Image(systemName: "crown.fill")
                    .foregroundColor(.yellow)
            }
        }
        .padding(.vertical, 4)
    }
}


