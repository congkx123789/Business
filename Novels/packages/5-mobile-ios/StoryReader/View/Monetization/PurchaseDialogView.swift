import SwiftUI

// Purchase Dialog View - Confirms PPC purchase
struct PurchaseDialogView: View {
    @Binding var isPresented: Bool
    let selectedChapters: [String]
    @ObservedObject var viewModel: PaywallViewModel
    let userId: String
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("Purchase \(selectedChapters.count) chapter(s)?")
                    .font(.headline)
                
                if viewModel.isPurchasing {
                    ProgressView("Processing…")
                }
                
                Button {
                    viewModel.purchaseBulk(chapterIds: selectedChapters, userId: userId)
                } label: {
                    Label("Confirm Purchase", systemImage: "checkmark.circle")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(viewModel.isPurchasing)
                
                Button("Cancel") {
                    isPresented = false
                }
                .frame(maxWidth: .infinity)
            }
            .padding()
            .navigationTitle("Confirm Purchase")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        isPresented = false
                    }
                }
            }
            .onReceive(viewModel.$purchaseSuccess) { success in
                if success {
                    isPresented = false
                }
            }
        }
    }
}


