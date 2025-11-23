import SwiftUI

// Rankings View - Story Rankings
struct RankingsView: View {
    @StateObject private var viewModel = RankingsViewModel()
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Filters
                VStack(spacing: 12) {
                    // Ranking type picker
                    Picker("Ranking Type", selection: $viewModel.selectedType) {
                        Text("Popularity").tag(DiscoveryRepository.RankingType.popularity)
                        Text("Monthly Votes").tag(DiscoveryRepository.RankingType.monthlyVotes)
                        Text("Sales").tag(DiscoveryRepository.RankingType.sales)
                        Text("Recommendations").tag(DiscoveryRepository.RankingType.recommendations)
                    }
                    .pickerStyle(.segmented)
                    .onChange(of: viewModel.selectedType) { _ in
                        viewModel.loadRankings()
                    }
                    
                    // Time range picker
                    Picker("Time Range", selection: $viewModel.selectedTimeRange) {
                        Text("Daily").tag(DiscoveryRepository.TimeRange.daily)
                        Text("Weekly").tag(DiscoveryRepository.TimeRange.weekly)
                        Text("Monthly").tag(DiscoveryRepository.TimeRange.monthly)
                        Text("All Time").tag(DiscoveryRepository.TimeRange.allTime)
                    }
                    .pickerStyle(.segmented)
                    .onChange(of: viewModel.selectedTimeRange) { _ in
                        viewModel.loadRankings()
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                
                // Rankings list
                if viewModel.isLoading {
                    ProgressView("Loading rankings...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if viewModel.rankings.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "chart.bar")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No rankings available")
                            .font(.headline)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(Array(viewModel.rankings.enumerated()), id: \.element.id) { index, story in
                            RankingRow(rank: index + 1, story: story)
                        }
                    }
                }
            }
            .navigationTitle("Rankings")
            .task {
                viewModel.loadRankings()
            }
        }
    }
}

struct RankingRow: View {
    let rank: Int
    let story: Story
    
    var body: some View {
        HStack(spacing: 16) {
            // Rank badge
            Text("\(rank)")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(rank <= 3 ? .blue : .secondary)
                .frame(width: 40)
            
            // Cover image
            Rectangle()
                .fill(Color.purple.opacity(0.2))
                .frame(width: 60, height: 80)
                .cornerRadius(8)
            
            // Story info
            VStack(alignment: .leading, spacing: 4) {
                Text(story.title)
                    .font(.headline)
                    .lineLimit(2)
                
                Text(story.author)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                if let description = story.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(2)
                }
            }
            
            Spacer()
        }
        .padding(.vertical, 4)
    }
}

