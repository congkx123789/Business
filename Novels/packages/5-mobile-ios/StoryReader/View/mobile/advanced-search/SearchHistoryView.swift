import SwiftUI

// Search History View - Displays previous queries
struct SearchHistoryView: View {
    let history: [String]
    var onSelected: (String) -> Void
    
    var body: some View {
        if history.isEmpty {
            EmptyView()
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(history, id: \.self) { item in
                        Button {
                            onSelected(item)
                        } label: {
                            Text(item)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 6)
                                .background(Color(.secondarySystemBackground))
                                .clipShape(Capsule())
                        }
                    }
                }
            }
        }
    }
}


