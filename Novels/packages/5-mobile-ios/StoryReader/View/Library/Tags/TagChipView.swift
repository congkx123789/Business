import SwiftUI

// Tag Chip View - Visual representation of a tag
struct TagChipView: View {
    let tag: Tag
    var isSelected: Bool = false
    
    private var color: Color {
        guard let hex = tag.color else { return .accentColor }
        return Color(hex: hex)
    }
    
    var body: some View {
        HStack(spacing: 6) {
            if let icon = tag.icon, !icon.isEmpty {
                Image(systemName: icon)
            }
            Text(tag.name)
                .font(.subheadline)
                .fontWeight(.medium)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(isSelected ? color.opacity(0.2) : Color(.secondarySystemBackground))
        .foregroundColor(isSelected ? color : .primary)
        .clipShape(Capsule())
        .overlay(
            Capsule()
                .stroke(color, lineWidth: isSelected ? 2 : 1)
        )
    }
}

// MARK: - Hex Color Helper

private extension Color {
    init(hex: String) {
        let scanner = Scanner(string: hex.replacingOccurrences(of: "#", with: ""))
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        self = Color(red: r, green: g, blue: b)
    }
}



