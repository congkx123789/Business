import Foundation
import AVFoundation

// TTS Engine Protocol
protocol TTSEngine {
    func synthesize(text: String, voice: String?, speed: Double) async throws -> Data
    func speak(text: String, voice: String?, speed: Double) async throws
    func stop()
    func pause()
    func resume()
    var isSpeaking: Bool { get }
    var currentProgress: Double { get } // 0.0 - 1.0
}

// Shared TTS Error enum
enum TTSError: Error {
    case engineNotAvailable
    case synthesisFailed
    case invalidVoice
    case notSupported
}

