import SwiftUI

// Filtered View Builder - Form for creating advanced filters
struct FilteredViewBuilderView: View {
    @Environment(\.dismiss) private var dismiss
    
    let onSave: (String, String?, FilterQuery, Bool) -> Void
    
    @State private var name: String = ""
    @State private var description: String = ""
    @State private var isAutoUpdating: Bool = true
    @State private var query = FilterQuery.empty
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Name", text: $name)
                    TextField("Description (optional)", text: $description)
                    Toggle("Auto-update", isOn: $isAutoUpdating)
                }
                
                Section("Query Builder") {
                    FilterQueryBuilderView(query: $query)
                }
            }
            .navigationTitle("New Filter")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(name, description.isEmpty ? nil : description, query, isAutoUpdating)
                        dismiss()
                    }
                    .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}



