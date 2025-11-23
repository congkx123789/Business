import SwiftUI

// Advanced Annotation Editor - Rich editor with template support
struct AdvancedAnnotationEditor: View {
    @ObservedObject var templatesViewModel: AnnotationTemplatesViewModel
    @Binding var selectedText: String
    @Binding var note: String
    @Binding var color: String
    
    let onSave: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Selected Text")
                .font(.caption)
                .foregroundColor(.secondary)
            Text(selectedText)
                .font(.headline)
                .padding()
                .background(Color(.secondarySystemBackground))
                .clipShape(RoundedRectangle(cornerRadius: 12))
            
            TextEditor(text: $note)
                .frame(height: 120)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.secondary.opacity(0.3)))
            
            ColorPicker("Highlight Color", selection: Binding(
                get: { Color(hex: color) },
                set: { color = $0.hexRGB }
            ))
            
            AnnotationTemplatesView(viewModel: templatesViewModel) { template in
                note = template.name
                if let templateColor = template.color {
                    color = templateColor
                }
            }
            
            Button {
                onSave()
            } label: {
                Label("Save Annotation", systemImage: "bookmark.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

private extension Color {
    init(hex: String) {
        let cleaned = hex.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        self = Color(red: r, green: g, blue: b)
    }
    
    var hexRGB: String {
        let uiColor = UIColor(self)
        var red: CGFloat = 0
        var green: CGFloat = 0
        var blue: CGFloat = 0
        uiColor.getRed(&red, green: &green, blue: &blue, alpha: nil)
        let r = Int(red * 255)
        let g = Int(green * 255)
        let b = Int(blue * 255)
        return String(format: "#%02X%02X%02X", r, g, b)
    }
}


