import SwiftUI

// WPM Tracker - Shows current reading speed
struct WPMTracker: View {
    let wordsPerMinute: Double
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Words Per Minute")
                .font(.headline)
            ProgressView(value: min(wordsPerMinute / 400, 1.0))
                .tint(.green)
            Text("\(Int(wordsPerMinute)) wpm")
                .font(.title2)
                .fontWeight(.bold)
        }
        .padding()
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}


