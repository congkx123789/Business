import SwiftUI

struct ReviewHelpfulVotingView: View {
    let helpfulCount: Int
    let notHelpfulCount: Int
    let onHelpful: () -> Void
    let onNotHelpful: () -> Void
    
    var body: some View {
        HStack(spacing: 12) {
            Button(action: onHelpful) {
                Label("\(helpfulCount)", systemImage: "hand.thumbsup.fill")
                    .labelStyle(.titleAndIcon)
            }
            .buttonStyle(.bordered)
            
            Button(action: onNotHelpful) {
                Label("\(notHelpfulCount)", systemImage: "hand.thumbsdown.fill")
                    .labelStyle(.titleAndIcon)
            }
            .buttonStyle(.bordered)
            
            Spacer()
        }
        .font(.caption)
        .foregroundColor(.secondary)
    }
}


