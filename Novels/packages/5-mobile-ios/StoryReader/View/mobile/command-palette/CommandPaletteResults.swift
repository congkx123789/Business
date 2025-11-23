import SwiftUI

// Command Palette Results - Displays search results by type
struct CommandPaletteResults: View {
    let results: [CommandPaletteViewModel.CommandResult]
    var onSelect: (CommandPaletteViewModel.CommandResult) -> Void
    
    var body: some View {
        List {
            ForEach(results) { result in
                Button {
                    onSelect(result)
                } label: {
                    HStack {
                        Image(systemName: result.icon ?? icon(for: result.type))
                            .foregroundColor(.accentColor)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(result.title)
                                .font(.headline)
                            if let subtitle = result.subtitle {
                                Text(subtitle)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .listStyle(.plain)
    }
    
    private func icon(for type: CommandPaletteViewModel.ResultType) -> String {
        switch type {
        case .story: return "book"
        case .chapter: return "list.number"
        case .annotation: return "highlighter"
        case .setting: return "gear"
        case .action: return "bolt"
        }
    }
}


