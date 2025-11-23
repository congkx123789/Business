import SwiftUI

struct ReviewFormView: View {
    let storyId: String
    let onSubmit: (ReviewInput) -> Void
    
    @Environment(\.dismiss) private var dismiss
    
    @State private var rating: Double = 4.0
    @State private var title: String = ""
    @State private var content: String = ""
    @State private var plot: Double = 4.0
    @State private var characters: Double = 4.0
    @State private var pacing: Double = 4.0
    @State private var worldBuilding: Double = 4.0
    @State private var writingStyle: Double = 4.0
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Overall Rating") {
                    RatingSlider(value: $rating)
                }
                
                Section("Title (optional)") {
                    TextField("Great worldbuilding", text: $title)
                }
                
                Section("Review") {
                    TextEditor(text: $content)
                        .frame(minHeight: 120)
                }
                
                Section("Detailed Ratings") {
                    RatingSlider(label: "Plot", value: $plot)
                    RatingSlider(label: "Characters", value: $characters)
                    RatingSlider(label: "Pacing", value: $pacing)
                    RatingSlider(label: "Worldbuilding", value: $worldBuilding)
                    RatingSlider(label: "Writing Style", value: $writingStyle)
                }
            }
            .navigationTitle("Write a Review")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel", role: .cancel) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Submit") {
                        let ratings = ReviewRatings(
                            plot: plot,
                            characters: characters,
                            worldBuilding: worldBuilding,
                            pacing: pacing,
                            writingStyle: writingStyle
                        )
                        let input = ReviewInput(
                            storyId: storyId,
                            rating: rating,
                            title: title.isEmpty ? nil : title,
                            content: content,
                            ratings: ratings
                        )
                        onSubmit(input)
                        dismiss()
                    }
                    .disabled(content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
    }
}

private struct RatingSlider: View {
    var label: String = "Score"
    @Binding var value: Double
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(label)
                Spacer()
                Text(String(format: "%.1f", value))
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Slider(value: $value, in: 1...5, step: 0.5)
        }
    }
}


