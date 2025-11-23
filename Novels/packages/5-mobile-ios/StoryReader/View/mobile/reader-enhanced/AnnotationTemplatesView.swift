import SwiftUI

// Annotation Templates View - Lists reusable templates
struct AnnotationTemplatesView: View {
    @ObservedObject var viewModel: AnnotationTemplatesViewModel
    var onTemplateSelected: (AnnotationTemplatesViewModel.AnnotationTemplate) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Templates")
                    .font(.headline)
                Spacer()
                Button {
                    viewModel.loadTemplates(userId: AuthService.shared.getCurrentUserId())
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(viewModel.templates, id: \.id) { template in
                        Button {
                            onTemplateSelected(template)
                        } label: {
                            VStack(alignment: .leading) {
                                Text(template.name)
                                    .fontWeight(.semibold)
                                Text(template.tags.joined(separator: ", "))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            .padding()
                            .background(Color(.secondarySystemBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                    }
                }
            }
        }
        .onAppear {
            if viewModel.templates.isEmpty {
                viewModel.loadTemplates(userId: "current-user-id")
            }
        }
    }
}


