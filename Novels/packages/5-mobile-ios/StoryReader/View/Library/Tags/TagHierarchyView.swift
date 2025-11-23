import SwiftUI

// Tag Hierarchy View - Recursive tree representation for tags
struct TagHierarchyView: View {
    let tags: [Tag]
    var onTagSelected: ((Tag) -> Void)?
    
    var body: some View {
        ForEach(tags) { tag in
            DisclosureGroup {
                if let children = tag.childTags, !children.isEmpty {
                    TagHierarchyView(tags: children, onTagSelected: onTagSelected)
                        .padding(.leading, 12)
                } else {
                    Text("No child tags")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.leading, 12)
                }
            } label: {
                TagChipView(tag: tag)
            }
            .contentShape(Rectangle())
            .onTapGesture {
                onTagSelected?(tag)
            }
        }
    }
}



