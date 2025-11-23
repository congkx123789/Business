import SwiftUI

struct CommentSortSelectorView: View {
    let selectedSort: ChapterCommentSort
    let onChange: (ChapterCommentSort) -> Void
    
    var body: some View {
        Menu {
            ForEach(ChapterCommentSort.allCases, id: \.self) { sort in
                Button {
                    onChange(sort)
                } label: {
                    HStack {
                        Text(label(for: sort))
                        if sort == selectedSort {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            }
        } label: {
            Label(label(for: selectedSort), systemImage: "arrow.up.arrow.down")
        }
    }
    
    private func label(for sort: ChapterCommentSort) -> String {
        switch sort {
        case .newest: return "Newest"
        case .oldest: return "Oldest"
        case .mostLiked: return "Most liked"
        }
    }
}


