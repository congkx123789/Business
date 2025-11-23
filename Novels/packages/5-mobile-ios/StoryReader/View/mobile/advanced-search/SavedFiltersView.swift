import SwiftUI

// Saved Filters View - Displays saved filter definitions
struct SavedFiltersView: View {
    let presets: [AdvancedSearchViewModel.FilterPreset]
    var onDelete: (AdvancedSearchViewModel.FilterPreset) -> Void
    
    var body: some View {
        List {
            ForEach(presets, id: \.id) { preset in
                VStack(alignment: .leading, spacing: 4) {
                    Text(preset.name)
                        .font(.headline)
                    Text("Created \(preset.createdAt.formatted(date: .long, time: .omitted))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .swipeActions {
                    Button(role: .destructive) {
                        onDelete(preset)
                    } label: {
                        Label("Delete", systemImage: "trash")
                    }
                }
            }
        }
    }
}


