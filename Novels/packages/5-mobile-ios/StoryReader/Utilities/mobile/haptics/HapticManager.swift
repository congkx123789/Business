import Foundation
import UIKit

// Haptic Manager - Haptic feedback manager
class HapticManager {
    static let shared = HapticManager()
    
    private init() {}
    
    // Impact feedback
    func impact(style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }
    
    // Notification feedback
    func notification(type: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(type)
    }
    
    // Selection feedback
    func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }
    
    // Success feedback
    func success() {
        notification(type: .success)
    }
    
    // Error feedback
    func error() {
        notification(type: .error)
    }
    
    // Warning feedback
    func warning() {
        notification(type: .warning)
    }
}


