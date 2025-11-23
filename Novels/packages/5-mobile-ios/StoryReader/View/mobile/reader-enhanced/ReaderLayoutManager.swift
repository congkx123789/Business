import SwiftUI

// Reader Layout Manager - Controls layout presets (scroll/page/multi-column)
struct ReaderLayoutManager: View {
    @ObservedObject var viewModel: StoryReaderViewModel
    @Binding var columnCount: Int
    
    var body: some View {
        Form {
            Section("Layout") {
                Picker("Reading Mode", selection: Binding(
                    get: { viewModel.preferences.readingMode },
                    set: { newMode in
                        var prefs = viewModel.preferences
                        prefs.readingMode = newMode
                        viewModel.updatePreferences(prefs)
                    })
                ) {
                    Text("Scroll").tag(ReadingPreferences.ReadingMode.scroll)
                    Text("Page Turn").tag(ReadingPreferences.ReadingMode.pageTurn)
                    Text("Multi Column").tag(ReadingPreferences.ReadingMode.multiColumn)
                }
                .pickerStyle(.segmented)
            }
            
            if viewModel.preferences.readingMode == .multiColumn {
                Section("Columns") {
                    Stepper(value: $columnCount, in: 2...4) {
                        Text("\(columnCount) Columns")
                    }
                }
            }
            
            Section("Typography") {
                Slider(value: Binding(
                    get: { Double(viewModel.preferences.fontSize) },
                    set: { newValue in
                        var prefs = viewModel.preferences
                        prefs.fontSize = Int(newValue)
                        viewModel.updatePreferences(prefs)
                    }
                ), in: 12...24, step: 1) {
                    Text("Font Size")
                }
                Text("Current: \(viewModel.preferences.fontSize)pt")
            }
        }
        .navigationTitle("Layout Manager")
    }
}


