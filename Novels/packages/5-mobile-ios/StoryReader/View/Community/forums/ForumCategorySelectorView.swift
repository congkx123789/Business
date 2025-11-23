import SwiftUI

struct ForumCategorySelectorView: View {
    let categories = ["All", "Spoilers", "Predictions", "Lore", "Help"]
    let selectedCategory: String?
    let onSelect: (String?) -> Void
    
    var body: some View {
        Menu {
            ForEach(categories, id: \.self) { category in
                Button {
                    onSelect(category == "All" ? nil : category)
                } label: {
                    HStack {
                        Text(category)
                        let isSelected = (category == "All" && selectedCategory == nil) || selectedCategory == category
                        if isSelected {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            }
        } label: {
            Label(selectedCategory ?? "All categories", systemImage: "line.3.horizontal.decrease.circle")
        }
    }
}


