import SwiftUI

// Command Palette View - Swipe-down searchable overlay
struct CommandPaletteView: View {
    @StateObject private var viewModel = CommandPaletteViewModel()
    
    var body: some View {
        ZStack {
            if viewModel.isOpen {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .onTapGesture {
                        viewModel.close()
                    }
                
                VStack(spacing: 12) {
                    TextField("Search stories, chapters, annotations, settings…", text: $viewModel.searchQuery)
                        .textFieldStyle(.roundedBorder)
                        .onChange(of: viewModel.searchQuery) { query in
                            viewModel.search(query: query)
                        }
                        .padding()
                    
                    CommandPaletteResults(results: viewModel.searchResults) { result in
                        viewModel.executeCommand(result)
                    }
                    .frame(maxHeight: 400)
                }
                .padding()
            }
        }
        .gesture(
            DragGesture(minimumDistance: 20, coordinateSpace: .global)
                .onEnded { value in
                    if value.translation.height > 50 {
                        viewModel.open()
                    }
                }
        )
    }
}


