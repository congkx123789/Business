import Foundation
import Combine
import AVFoundation

// TTS Manager - Delegates to appropriate engine based on user settings
class TextToSpeechManager: ObservableObject {
    static let shared = TextToSpeechManager()
    
    @Published var isSpeaking: Bool = false
    @Published var currentProgress: Double = 0.0
    @Published var selectedEngine: TTSEngineType = .native
    @Published var selectedVoice: String?
    @Published var speed: Double = 1.0
    
    private var currentEngine: TTSEngine {
        switch selectedEngine {
        case .native:
            return nativeEngine
        case .embedded:
            return embeddedEngine
        }
    }
    
    private let nativeEngine = NativeTTSEngine()
    private let embeddedEngine = EmbeddedTTSEngine()
    
    init() {
        // Engines are initialized
    }
    
    // Synthesize speech (for audio file generation)
    func synthesize(text: String) async throws -> Data {
        return try await currentEngine.synthesize(text: text, voice: selectedVoice, speed: speed)
    }
    
    // Speak text (for immediate playback)
    func speak(text: String) async throws {
        try await currentEngine.speak(text: text, voice: selectedVoice, speed: speed)
        isSpeaking = currentEngine.isSpeaking
        currentProgress = currentEngine.currentProgress
    }
    
    func stop() {
        currentEngine.stop()
        isSpeaking = false
        currentProgress = 0.0
    }
    
    func pause() {
        currentEngine.pause()
        isSpeaking = false
    }
    
    func resume() {
        currentEngine.resume()
        isSpeaking = true
    }
    
    // Get available voices
    func getAvailableVoices() -> [AVSpeechSynthesisVoice] {
        return AVSpeechSynthesisVoice.speechVoices()
    }
}

enum TTSEngineType: String, Codable {
    case native = "native" // AVSpeechSynthesizer
    case embedded = "embedded" // Proprietary SDK (60MB)
}

