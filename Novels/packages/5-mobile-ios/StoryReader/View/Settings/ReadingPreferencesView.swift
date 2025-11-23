import SwiftUI

// Reading Preferences View - Settings for reading experience
struct ReadingPreferencesView: View {
    @ObservedObject var viewModel: StoryReaderViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationStack {
            Form {
                // Font settings
                Section("Font") {
                    HStack {
                        Text("Font Size")
                        Spacer()
                        Text("\(viewModel.preferences.fontSize)px")
                            .foregroundColor(.secondary)
                    }
                    
                    Slider(value: Binding(
                        get: { Double(viewModel.preferences.fontSize) },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.fontSize = Int(newValue)
                            viewModel.updatePreferences(prefs)
                        }
                    ), in: 12...24, step: 1)
                    
                    HStack {
                        Text("Line Height")
                        Spacer()
                        Text("\(viewModel.preferences.lineHeight, specifier: "%.1f")")
                            .foregroundColor(.secondary)
                    }
                    
                    Slider(value: Binding(
                        get: { viewModel.preferences.lineHeight },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.lineHeight = newValue
                            viewModel.updatePreferences(prefs)
                        }
                    ), in: 1.0...2.5, step: 0.1)
                }
                
                // Background settings
                Section("Background") {
                    Picker("Background Mode", selection: Binding(
                        get: { viewModel.preferences.backgroundColor },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.backgroundColor = newValue
                            viewModel.updatePreferences(prefs)
                        }
                    )) {
                        Text("Day").tag("#ffffff")
                        Text("Night").tag("#0f172a")
                        Text("Sepia").tag("#fbf0d9")
                        Text("Eye Protection").tag("#e0f2e0")
                    }
                    
                    HStack {
                        Text("Brightness")
                        Spacer()
                        Text("\(viewModel.preferences.brightness, specifier: "%.2f")")
                            .foregroundColor(.secondary)
                    }
                    
                    Slider(value: Binding(
                        get: { viewModel.preferences.brightness },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.brightness = newValue
                            viewModel.updatePreferences(prefs)
                        }
                    ), in: 0.6...1.2, step: 0.01)
                }
                
                // Reading mode
                Section("Reading Mode") {
                    Picker("Mode", selection: Binding(
                        get: { viewModel.preferences.readingMode },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.readingMode = newValue
                            viewModel.updatePreferences(prefs)
                        }
                    )) {
                        Text("Scroll").tag(ReadingPreferences.ReadingMode.scroll)
                        Text("Page Turn").tag(ReadingPreferences.ReadingMode.pageTurn)
                        Text("Multi Column").tag(ReadingPreferences.ReadingMode.multiColumn)
                    }
                }
                
                // Control settings
                Section("Controls") {
                    Toggle("Tap to Toggle Controls", isOn: Binding(
                        get: { viewModel.preferences.tapToToggleControls },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.tapToToggleControls = newValue
                            viewModel.updatePreferences(prefs)
                        }
                    ))
                    
                    Toggle("Auto-hide Controls", isOn: Binding(
                        get: { viewModel.preferences.autoHideControls },
                        set: { newValue in
                            var prefs = viewModel.preferences
                            prefs.autoHideControls = newValue
                            viewModel.updatePreferences(prefs)
                        }
                    ))
                    
                    if viewModel.preferences.autoHideControls {
                        HStack {
                            Text("Controls Timeout")
                            Spacer()
                            Text("\(viewModel.preferences.controlsTimeout / 1000)s")
                                .foregroundColor(.secondary)
                        }
                        
                        Slider(value: Binding(
                            get: { Double(viewModel.preferences.controlsTimeout) },
                            set: { newValue in
                                var prefs = viewModel.preferences
                                prefs.controlsTimeout = Int(newValue)
                                viewModel.updatePreferences(prefs)
                            }
                        ), in: 1000...10000, step: 500)
                    }
                }
            }
            .navigationTitle("Reading Settings")
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

