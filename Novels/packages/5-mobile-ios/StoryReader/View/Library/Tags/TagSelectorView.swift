import SwiftUI

// Tag Selector View - Multi-select control for tags
struct TagSelectorView: View {
    @Binding var selectedTagIds: Set<String>
    let tags: [Tag]
    var allowsMultipleSelection: Bool = true
    var onSelectionChange: ((Set<String>) -> Void)?
    
    private var columns: [GridItem] {
        [GridItem(.adaptive(minimum: 120), spacing: 12)]
    }
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(tags) { tag in
                    TagChipView(tag: tag, isSelected: selectedTagIds.contains(tag.id))
                        .onTapGesture {
                            toggleSelection(for: tag)
                        }
                        .animation(.spring(), value: selectedTagIds)
                }
            }
            .padding()
        }
        .background(Color(.systemBackground))
    }
    
    private func toggleSelection(for tag: Tag) {
        if selectedTagIds.contains(tag.id) {
            selectedTagIds.remove(tag.id)
        } else {
            if allowsMultipleSelection {
                selectedTagIds.insert(tag.id)
            } else {
                selectedTagIds = [tag.id]
            }
        }
        onSelectionChange?(selectedTagIds)
    }
}



