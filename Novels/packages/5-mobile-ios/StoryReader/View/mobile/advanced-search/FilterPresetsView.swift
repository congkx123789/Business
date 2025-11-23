import SwiftUI

// Filter Presets View - Saved preset chips
struct FilterPresetsView: View {
    let presets: [AdvancedSearchViewModel.FilterPreset]
    var onPresetSelected: (AdvancedSearchViewModel.FilterPreset) -> Void
    
    var body: some View {
        if presets.isEmpty {
            Text("No saved filters yet.")
                .font(.caption)
                .foregroundColor(.secondary)
        } else {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(presets, id: \.id) { preset in
                        Button {
                            onPresetSelected(preset)
                        } label: {
                            VStack(alignment: .leading) {
                                Text(preset.name)
                                    .font(.headline)
                                Text(preset.createdAt, style: .date)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding(12)
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
                .padding(.vertical, 8)
            }
        }
    }
}


