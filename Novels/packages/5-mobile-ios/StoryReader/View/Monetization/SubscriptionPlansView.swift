import SwiftUI

// Subscription Plans View - Shows membership plans
struct SubscriptionPlansView: View {
    @StateObject private var viewModel = SubscriptionViewModel()
    let userId: String
    
    var body: some View {
        List {
            ForEach(viewModel.plans, id: \.id) { plan in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(plan.name)
                            .font(.headline)
                        Spacer()
                        Text(String(format: "$%.2f / mo", plan.price))
                            .font(.subheadline)
                    }
                    Text(plan.description ?? "")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Button {
                        viewModel.subscribe(userId: userId, planId: plan.id)
                    } label: {
                        Text("Choose Plan")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(.vertical, 8)
            }
        }
        .navigationTitle("Subscription Plans")
        .task {
            viewModel.loadPlans()
        }
        .alert("Subscription Error", isPresented: Binding(
            get: { viewModel.errorMessage != nil },
            set: { _ in viewModel.errorMessage = nil }
        )) {
            Button("OK") { }
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }
}


