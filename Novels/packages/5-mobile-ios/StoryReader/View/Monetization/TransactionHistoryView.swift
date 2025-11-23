import SwiftUI

// Transaction History View - Displays wallet transactions
struct TransactionHistoryView: View {
    @StateObject private var walletViewModel = WalletViewModel()
    
    var body: some View {
        List {
            ForEach(walletViewModel.transactions, id: \.id) { transaction in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(transaction.description ?? "Transaction")
                            .font(.headline)
                        Spacer()
                        Text(transaction.createdAt, style: .date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    HStack {
                        Text("\(transaction.amount) Coins")
                            .font(.subheadline)
                        Spacer()
                        Text(transaction.type.rawValue.capitalized)
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color.accentColor.opacity(0.1))
                            .clipShape(Capsule())
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Transactions")
        .task {
            walletViewModel.loadWallet()
        }
    }
}


