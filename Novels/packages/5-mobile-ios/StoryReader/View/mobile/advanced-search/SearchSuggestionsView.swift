import SwiftUI

// Search Suggestions View - Inline suggestion list
struct SearchSuggestionsView: View {
    let suggestions: [String]
    var onSuggestionTap: (String) -> Void
    
    var body: some View {
        if suggestions.isEmpty {
            EmptyView()
        } else {
            VStack(alignment: .leading, spacing: 8) {
                ForEach(suggestions, id: \.self) { suggestion in
                    Button {
                        onSuggestionTap(suggestion)
                    } label: {
                        HStack {
                            Image(systemName: "magnifyingglass")
                            Text(suggestion)
                            Spacer()
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .padding(.vertical, 8)
        }
    }
}


