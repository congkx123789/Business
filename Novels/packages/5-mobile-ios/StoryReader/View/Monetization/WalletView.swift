import SwiftUI

// Wallet View - Virtual Currency & Top-up
struct WalletView: View {
    @StateObject private var viewModel = WalletViewModel()
    @State private var showTopUpSheet = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Balance display
                VStack(spacing: 8) {
                    Text("Current Balance")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    if let wallet = viewModel.wallet {
                        Text("\(wallet.balance)")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundColor(.primary)
                        +
                        Text(" points")
                            .font(.title3)
                            .foregroundColor(.secondary)
                    } else {
                        ProgressView()
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)
                
                // Top-up button
                Button(action: {
                    showTopUpSheet = true
                }) {
                    HStack {
                        Image(systemName: "plus.circle.fill")
                        Text("Top Up Wallet")
                    }
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(12)
                }
                
                // Transaction history
                if !viewModel.transactions.isEmpty {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Transactions")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        ForEach(viewModel.transactions.prefix(10)) { transaction in
                            TransactionRow(transaction: transaction)
                        }
                    }
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Wallet")
            .task {
                viewModel.loadWallet()
            }
            .sheet(isPresented: $showTopUpSheet) {
                TopUpView(viewModel: viewModel)
            }
            .alert("Error", isPresented: .constant(viewModel.errorMessage != nil)) {
                Button("OK") {
                    viewModel.errorMessage = nil
                }
            } message: {
                if let error = viewModel.errorMessage {
                    Text(error)
                }
            }
        }
    }
}

struct TransactionRow: View {
    let transaction: Transaction
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(transaction.type.rawValue.capitalized)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                
                if let description = transaction.description {
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Text(transaction.createdAt, style: .relative)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(transaction.type == .topUp ? "+\(transaction.amount)" : "-\(transaction.amount)")
                .font(.headline)
                .foregroundColor(transaction.type == .topUp ? .green : .red)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct TopUpView: View {
    @ObservedObject var viewModel: WalletViewModel
    @Environment(\.dismiss) var dismiss
    
    @State private var amount: Int = 1000
    @State private var paymentMethod: String = "credit-card"
    
    let presetAmounts = [100, 500, 1000, 2000, 5000, 10000]
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                // Amount selection
                VStack(alignment: .leading, spacing: 12) {
                    Text("Select Amount")
                        .font(.headline)
                    
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        ForEach(presetAmounts, id: \.self) { preset in
                            Button(action: {
                                amount = preset
                            }) {
                                VStack {
                                    Text("\(preset)")
                                        .font(.headline)
                                    Text("$\(Double(preset) * 0.01, specifier: "%.2f")")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(amount == preset ? Color.blue.opacity(0.2) : Color(.systemGray6))
                                .cornerRadius(12)
                            }
                        }
                    }
                }
                
                // Payment method
                VStack(alignment: .leading, spacing: 12) {
                    Text("Payment Method")
                        .font(.headline)
                    
                    Picker("Payment Method", selection: $paymentMethod) {
                        Text("Credit Card").tag("credit-card")
                        Text("PayPal").tag("paypal")
                        Text("Apple Pay").tag("apple-pay")
                    }
                    .pickerStyle(.segmented)
                }
                
                // Confirm button
                Button(action: {
                    viewModel.topUp(amount: amount, paymentMethod: paymentMethod)
                    dismiss()
                }) {
                    Text("Top Up \(amount) points")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(12)
                }
                .disabled(viewModel.isLoading)
                
                Spacer()
            }
            .padding()
            .navigationTitle("Top Up Wallet")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

