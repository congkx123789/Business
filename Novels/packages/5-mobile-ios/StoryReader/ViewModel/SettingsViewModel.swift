import Foundation
import Combine
import SwiftUI

// Settings ViewModel - TTS & app settings
class SettingsViewModel: ObservableObject {
    @Published var readingPreferences: ReadingPreferences?
    @Published var ttsSettings: TTSSettings = TTSSettings()
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let readingPreferencesRepository = ReadingPreferencesRepository()
    private var cancellables = Set<AnyCancellable>()
    
    struct TTSSettings {
        var engine: TTSEngineType = .native
        var voice: String = "default"
        var speed: Double = 1.0
        var pitch: Double = 1.0
    }
    
    enum TTSEngineType: String, CaseIterable {
        case native = "Native (AVSpeechSynthesizer)"
        case embedded = "Embedded (High Quality)"
    }
    
    init() {
        loadSettings()
    }
    
    func loadSettings() {
        // Load reading preferences
        // This would typically load from UserDefaults or Core Data
        // For now, using default values
    }
    
    func updateTTSSettings(_ settings: TTSSettings) {
        ttsSettings = settings
        // Save to UserDefaults
        UserDefaults.standard.set(settings.engine.rawValue, forKey: "tts_engine")
        UserDefaults.standard.set(settings.voice, forKey: "tts_voice")
        UserDefaults.standard.set(settings.speed, forKey: "tts_speed")
        UserDefaults.standard.set(settings.pitch, forKey: "tts_pitch")
    }
    
    func updateReadingPreferences(_ preferences: ReadingPreferences) {
        isLoading = true
        errorMessage = nil
        
        readingPreferencesRepository.updatePreferences(preferences)
            .receive(on: DispatchQueue.main)
            .sink(
                receiveCompletion: { [weak self] completion in
                    self?.isLoading = false
                    if case .failure(let error) = completion {
                        self?.errorMessage = error.localizedDescription
                    }
                },
                receiveValue: { [weak self] updatedPreferences in
                    self?.readingPreferences = updatedPreferences
                }
            )
            .store(in: &cancellables)
    }
}


