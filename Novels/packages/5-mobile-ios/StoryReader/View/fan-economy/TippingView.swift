import SwiftUI

struct TippingView: View {
    let storyId: String
    
    @StateObject private var viewModel = TippingViewModel()
    @State private var selectedAmount: Int = 100
    @State private var customAmount: String = ""
    @State private var message: String = ""
    
    private let quickAmounts = [100, 200, 500, 1000, 2000]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Support the author")
                    .font(.title3)
                    .fontWeight(.semibold)
                Spacer()
                if viewModel.isLoading {
                    ProgressView()
                }
            }
            
            if let stats = viewModel.tipStats {
                TipStatsSummary(stats: stats)
            }
            
            Text("Choose amount")
                .font(.subheadline)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: 12)], spacing: 12) {
                ForEach(quickAmounts, id: \.self) { amount in
                    Button {
                        selectedAmount = amount
                        customAmount = ""
                    } label: {
                        Text("\(amount) pts")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(selectedAmount == amount ? Color.blue.opacity(0.15) : Color(.secondarySystemBackground))
                            .cornerRadius(12)
                    }
                }
            }
            
            HStack {
                TextField("Custom amount", text: $customAmount)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
                    .onChange(of: customAmount) { newValue in
                        if let value = Int(newValue) {
                            selectedAmount = value
                        }
                    }
                Text("pts")
                    .foregroundColor(.secondary)
            }
            
            TextField("Add a message (optional)", text: $message, axis: .vertical)
                .textFieldStyle(.roundedBorder)
            
            Button {
                viewModel.sendTip(storyId: storyId, amount: selectedAmount, message: message)
                message = ""
            } label: {
                if viewModel.isSubmitting {
                    ProgressView()
                        .tint(.white)
                } else {
                    Label("Send Tip", systemImage: "paperplane.fill")
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(selectedAmount <= 0 || viewModel.isSubmitting)
            
            if let error = viewModel.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            if !viewModel.tipHistory.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Recent tips")
                        .font(.headline)
                    ForEach(viewModel.tipHistory.prefix(5)) { tip in
                        TipHistoryRow(tip: tip)
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
            viewModel.loadData(storyId: storyId)
        }
    }
}

private struct TipStatsSummary: View {
    let stats: TipStats
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Total tips")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(stats.totalTips)")
                        .font(.title3)
                        .fontWeight(.bold)
                }
                Spacer()
                VStack(alignment: .leading) {
                    Text("Total amount")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(stats.totalAmount) pts")
                        .font(.title3)
                        .fontWeight(.bold)
                }
            }
            
            if !stats.topSupporters.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Top supporters")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    ForEach(stats.topSupporters.prefix(3)) { supporter in
                        HStack {
                            Text(supporter.username)
                            Spacer()
                            Text("\(supporter.amount) pts")
                        }
                        .font(.caption)
                    }
                }
            }
        }
    }
}

private struct TipHistoryRow: View {
    let tip: Tip
    
    var body: some View {
        HStack {
            VStack(alignment: .leading) {
                Text(tip.username)
                    .fontWeight(.semibold)
                if let message = tip.message, !message.isEmpty {
                    Text("“\(message)”")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            Spacer()
            VStack(alignment: .trailing) {
                Text("\(tip.amount) pts")
                    .fontWeight(.semibold)
                Text(tip.createdAt, style: .relative)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, 6)
    }
}


