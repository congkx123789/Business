import SwiftUI

// Search Builder View - Embed FilterQueryBuilder for advanced filtering
struct SearchBuilderView: View {
    @Binding var filterQuery: FilterQuery
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Build Advanced Filter")
                .font(.headline)
            FilterQueryBuilderView(query: $filterQuery)
        }
        .padding()
    }
}


