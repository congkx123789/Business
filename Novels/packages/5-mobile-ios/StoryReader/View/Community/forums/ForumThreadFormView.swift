import SwiftUI

struct ForumThreadFormView: View {
    let storyId: String
    let onSubmit: (String, String, String) -> Void
    
    @Environment(\.dismiss) private var dismiss
    
    @State private var title: String = ""
    @State private var category: String = "General"
    @State private var content: String = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Title") {
                    TextField("Enter thread title", text: $title)
                }
                
                Section("Category") {
                    Picker("Category", selection: $category) {
                        ForEach(["General", "Spoilers", "Theory", "Help"], id: \.self) {
                            Text($0)
                        }
                    }
                    .pickerStyle(.menu)
                }
                
                Section("Content") {
                    TextEditor(text: $content)
                        .frame(minHeight: 120)
                }
            }
            .navigationTitle("New Thread")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Post") {
                        onSubmit(title, category, content)
                        dismiss()
                    }
                    .disabled(title.isEmpty || content.isEmpty)
                }
            }
        }
    }
}


