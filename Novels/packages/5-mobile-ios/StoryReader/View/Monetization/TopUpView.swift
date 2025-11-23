import SwiftUI

// Top Up View - Allows user to add virtual currency
struct TopUpView: View {
    @StateObject private var walletViewModel = WalletViewModel()
    
    @State private var amount: Double = 9.99
    @State private var paymentMethod: String = "applePay"
    @State private var showSuccess = false
    @State private var transactionCount = 0
    
    private let amountOptions: [Double] = [4.99, 9.99, 19.99, 49.99, 99.99]
    
    var body: some View {
        Form {
            Section("Amount") {
                Picker("Select amount", selection: $amount) {
                    ForEach(amountOptions, id: \.self) { option in
                        Text(String(format: "$%.2f", option))
                            .tag(option)
                    }
                }
                .pickerStyle(.segmented)
            }
            
            Section("Payment Method") {
                Picker("Method", selection: $paymentMethod) {
                    Text("Apple Pay").tag("applePay")
                    Text("Credit Card").tag("card")
                    Text("Paypal").tag("paypal")
                }
            }
            
            Section {
                Button {
                    walletViewModel.topUp(amount: Int(amount * 100), paymentMethod: paymentMethod)
                } label: {
                    Label("Top Up Wallet", systemImage: "creditcard")
                }
                .disabled(walletViewModel.isLoading)
                
                if walletViewModel.isLoading {
                    ProgressView()
                }
            }
        }
        .navigationTitle("Top Up")
        .onReceive(walletViewModel.$transactions) { transactions in
            if transactions.count > transactionCount {
                transactionCount = transactions.count
                showSuccess = true
            }
        }
        .alert("Success", isPresented: $showSuccess) {
            Button("OK") { }
        } message: {
            Text("Wallet balance updated.")
        }
    }
}


