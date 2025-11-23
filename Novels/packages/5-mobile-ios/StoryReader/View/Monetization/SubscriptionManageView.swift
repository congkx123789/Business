import SwiftUI

// Subscription Manage View - Manage current membership
struct SubscriptionManageView: View {
    @StateObject private var viewModel = SubscriptionViewModel()
    let userId: String
    
    var body: some View {
        VStack(spacing: 16) {
            if let subscription = viewModel.subscription {
                VStack(alignment: .leading, spacing: 8) {
                    Text(subscription.planName)
                        .font(.title3)
                        .fontWeight(.semibold)
                    Text("Renews \(subscription.renewalDate, style: .date)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Button(role: .destructive) {
                        viewModel.cancelSubscription(userId: userId)
                    } label: {
                        Text("Cancel Subscription")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
                .padding()
                .background(Color(.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            } else if viewModel.isLoading {
                ProgressView("Loading subscription…")
            } else {
                Text("No active subscription.")
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Manage Subscription")
        .task {
            viewModel.loadSubscription(userId: userId)
        }
        .alert("Error", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { _ in viewModel.errorMessage = nil }
        )) {
            Button("OK") { }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}


