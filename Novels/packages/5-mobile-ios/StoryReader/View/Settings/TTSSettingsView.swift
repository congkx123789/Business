import SwiftUI

// TTS Settings View - TTS engine and voice selection
struct TTSSettingsView: View {
    @ObservedObject var ttsManager = TextToSpeechManager.shared
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                // TTS Engine selection
                Section("TTS Engine") {
                    Picker("Engine", selection: $ttsManager.selectedEngine) {
                        Text("Native (iOS)").tag(TTSEngineType.native)
                        Text("Embedded (High Quality)").tag(TTSEngineType.embedded)
                    }
                    
                    if ttsManager.selectedEngine == .native {
                        Text("Uses iOS native AVSpeechSynthesizer")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    } else {
                        Text("Uses proprietary 60MB SDK for high-quality voices")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                // Voice selection
                Section("Voice") {
                    let voices = ttsManager.getAvailableVoices()
                    Picker("Voice", selection: $ttsManager.selectedVoice) {
                        Text("Default").tag(nil as String?)
                        ForEach(voices, id: \.identifier) { voice in
                            Text("\(voice.name) (\(voice.language))")
                                .tag(voice.identifier as String?)
                        }
                    }
                }
                
                // Speed control
                Section("Playback Speed") {
                    HStack {
                        Text("Speed")
                        Spacer()
                        Text("\(ttsManager.speed, specifier: "%.1f")x")
                            .foregroundColor(.secondary)
                    }
                    
                    Slider(value: $ttsManager.speed, in: 0.5...2.0, step: 0.1)
                }
                
                // Test button
                Section {
                    Button(action: {
                        Task {
                            try? await ttsManager.speak(text: "This is a test of the text-to-speech system.")
                        }
                    }) {
                        HStack {
                            Image(systemName: "play.circle.fill")
                            Text("Test Voice")
                        }
                    }
                }
            }
            .navigationTitle("TTS Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

