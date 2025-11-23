import Foundation
import AVFoundation
import Combine

// Native TTS Engine - AVSpeechSynthesizer (iOS native)
class NativeTTSEngine: NSObject, TTSEngine {
    private let synthesizer = AVSpeechSynthesizer()
    private var currentUtterance: AVSpeechUtterance?
    private var progressTimer: Timer?
    private var startTime: Date?
    
    var isSpeaking: Bool = false
    var currentProgress: Double = 0.0
    
    override init() {
        super.init()
        synthesizer.delegate = self
    }
    
    func synthesize(text: String, voice: String?, speed: Double) async throws -> Data {
        // Native TTS doesn't support audio data export directly
        // Would need to use AVAudioEngine to record the output
        throw TTSError.notSupported
    }
    
    func speak(text: String, voice: String?, speed: Double) async throws {
        stop()
        
        let utterance = AVSpeechUtterance(string: text)
        
        // Set voice
        if let voiceIdentifier = voice {
            utterance.voice = AVSpeechSynthesisVoice(identifier: voiceIdentifier)
        } else {
            utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        }
        
        // Set rate (0.0 - 1.0, default 0.5)
        utterance.rate = Float(speed * 0.5)
        
        // Set pitch (0.5 - 2.0, default 1.0)
        utterance.pitchMultiplier = 1.0
        
        currentUtterance = utterance
        startTime = Date()
        synthesizer.speak(utterance)
        isSpeaking = true
        
        // Start progress tracking
        startProgressTracking()
    }
    
    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        isSpeaking = false
        currentProgress = 0.0
        startTime = nil
        progressTimer?.invalidate()
    }
    
    func pause() {
        synthesizer.pauseSpeaking(at: .immediate)
        isSpeaking = false
        progressTimer?.invalidate()
    }
    
    func resume() {
        synthesizer.continueSpeaking()
        isSpeaking = true
        if startTime == nil {
            startTime = Date()
        }
        startProgressTracking()
    }
    
    private func startProgressTracking() {
        progressTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            guard let self = self,
                  let utterance = self.currentUtterance,
                  let startTime = self.startTime else { return }
            
            // Estimate progress based on time (approximate)
            // AVSpeechSynthesizer doesn't provide exact progress
            let estimatedDuration = Double(utterance.speechString.count) / 150.0 // ~150 chars per second
            let elapsed = Date().timeIntervalSince(startTime)
            self.currentProgress = min(elapsed / estimatedDuration, 1.0)
        }
    }
    
    // TTSError is now defined in TTSEngine.swift
}

extension NativeTTSEngine: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        isSpeaking = false
        currentProgress = 1.0
        startTime = nil
        progressTimer?.invalidate()
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        isSpeaking = false
        currentProgress = 0.0
        startTime = nil
        progressTimer?.invalidate()
    }
}

