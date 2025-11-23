import SwiftUI

// Layout Settings View - Reader layout preferences
struct LayoutSettingsView: View {
    @ObservedObject var viewModel: StoryReaderViewModel
    
    var body: some View {
        Form {
            Section("Mode") {
                Picker("Reading Mode", selection: Binding(
                    get: { viewModel.preferences.readingMode },
                    set: { newValue in
                        var prefs = viewModel.preferences
                        prefs.readingMode = newValue
                        viewModel.updatePreferences(prefs)
                    })
                ) {
                    Text("Scroll").tag(ReadingPreferences.ReadingMode.scroll)
                    Text("Page Turn").tag(ReadingPreferences.ReadingMode.pageTurn)
                    Text("Multi Column").tag(ReadingPreferences.ReadingMode.multiColumn)
                }
                .pickerStyle(.segmented)
            }
            
            Section("Spacing") {
                Slider(value: Binding(
                    get: { Double(viewModel.preferences.lineHeight) },
                    set: { newValue in
                        var prefs = viewModel.preferences
                        prefs.lineHeight = Int(newValue)
                        viewModel.updatePreferences(prefs)
                    }
                ), in: 0...12, step: 1) {
                    Text("Line Height")
                }
                Text("Current: \(viewModel.preferences.lineHeight)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .navigationTitle("Layout Settings")
    }
}


