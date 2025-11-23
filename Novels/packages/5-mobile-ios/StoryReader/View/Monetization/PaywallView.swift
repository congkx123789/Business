import SwiftUI

// Paywall View - Shows pay-per-chapter pricing
struct PaywallView: View {
    @StateObject private var viewModel = PaywallViewModel()
    
    let storyId: String
    let userId: String
    
    @State private var selectedChapters: Set<String> = []
    @State private var showPurchaseDialog = false
    
    var body: some View {
        VStack(spacing: 16) {
            if let info = viewModel.paywallInfo {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Free Chapters: \(info.freeChapters)")
                        .font(.subheadline)
                    Text("Balance: \(Int(info.userBalance)) Coins")
                        .font(.headline)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color(.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                
                List(info.paidChapters, id: \.chapterId) { chapter in
                    HStack {
                        VStack(alignment: .leading) {
                            Text("Chapter \(chapter.chapterNumber)")
                                .font(.headline)
                            Text("\(chapter.characterCount) characters")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        Spacer()
                        Text("\(Int(chapter.price)) Coins")
                            .font(.subheadline)
                        Image(systemName: selectedChapters.contains(chapter.chapterId) ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(.accentColor)
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        toggleSelection(chapterId: chapter.chapterId)
                    }
                }
                
                Button {
                    showPurchaseDialog = true
                } label: {
                    Label("Purchase Selected", systemImage: "shield.checkerboard")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(selectedChapters.isEmpty)
                .padding(.horizontal)
            } else {
                ProgressView("Loading paywall…")
            }
        }
        .navigationTitle("Unlock Chapters")
        .task {
            viewModel.loadPaywallInfo(storyId: storyId, userId: userId)
        }
        .sheet(isPresented: $showPurchaseDialog) {
            PurchaseDialogView(
                isPresented: $showPurchaseDialog,
                selectedChapters: Array(selectedChapters),
                viewModel: viewModel,
                userId: userId
            )
        }
        .alert("Purchase Error", isPresented: Binding(
            get: { viewModel.purchaseError != nil },
            set: { _ in viewModel.purchaseError = nil }
        )) {
            Button("OK") { }
        } message: {
            Text(viewModel.purchaseError ?? "")
        }
    }
    
    private func toggleSelection(chapterId: String) {
        if selectedChapters.contains(chapterId) {
            selectedChapters.remove(chapterId)
        } else {
            selectedChapters.insert(chapterId)
        }
    }
}


