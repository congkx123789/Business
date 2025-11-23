import SwiftUI

// TTS Player View - Controls for text-to-speech
struct TTSPlayerView: View {
    @ObservedObject var viewModel: StoryReaderViewModel
    
    var body: some View {
        VStack(spacing: 12) {
            // Progress bar
            if viewModel.isTTSPlaying {
                ProgressView(value: viewModel.ttsProgress)
                    .tint(.blue)
            }
            
            // Controls
            HStack(spacing: 20) {
                // Play/Pause button
                Button(action: {
                    if viewModel.isTTSPlaying {
                        viewModel.pauseTTS()
                    } else {
                        viewModel.playTTS()
                    }
                }) {
                    Image(systemName: viewModel.isTTSPlaying ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 32))
                        .foregroundColor(.blue)
                }
                
                // Stop button
                Button(action: {
                    viewModel.stopTTS()
                }) {
                    Image(systemName: "stop.circle.fill")
                        .font(.system(size: 24))
                        .foregroundColor(.red)
                }
                
                Spacer()
                
                // Speed control
                VStack(spacing: 4) {
                    Text("Speed")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("\(viewModel.ttsManager.speed, specifier: "%.1f")x")
                        .font(.caption)
                        .fontWeight(.semibold)
                }
                
                Slider(value: $viewModel.ttsManager.speed, in: 0.5...2.0, step: 0.1)
                    .frame(width: 100)
            }
            .padding()
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .padding()
    }
}

