import SwiftUI

// Annotation Search View - Search annotations by text/tag/date
struct AnnotationSearchView: View {
    @State private var query: String = ""
    @State private var filteredAnnotations: [Annotation] = []
    
    let annotations: [Annotation]
    
    var body: some View {
        VStack {
            TextField("Search annotations", text: $query)
                .textFieldStyle(.roundedBorder)
                .padding()
                .onChange(of: query) { _ in
                    filterAnnotations()
                }
            
            List(filteredAnnotations) { annotation in
                VStack(alignment: .leading) {
                    Text(annotation.selectedText)
                        .font(.headline)
                    if let note = annotation.note {
                        Text(note)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .onAppear {
            filteredAnnotations = annotations
        }
    }
    
    private func filterAnnotations() {
        guard !query.isEmpty else {
            filteredAnnotations = annotations
            return
        }
        filteredAnnotations = annotations.filter {
            $0.selectedText.localizedCaseInsensitiveContains(query) ||
            ($0.note?.localizedCaseInsensitiveContains(query) ?? false)
        }
    }
}


