import UIKit

/// Wraps UIActivityViewController creation for sharing exports
final class ShareSheetManager {
    static let shared = ShareSheetManager()
    private init() {}
    
    func controller(for url: URL) -> UIActivityViewController {
        UIActivityViewController(activityItems: [url], applicationActivities: nil)
    }
}


