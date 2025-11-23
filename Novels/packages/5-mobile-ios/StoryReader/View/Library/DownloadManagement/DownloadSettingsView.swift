import SwiftUI

// Download Settings View - Auto-download preferences
struct DownloadSettingsView: View {
    @AppStorage("autoDownloadEnabled") private var autoDownloadEnabled = false
    @AppStorage("autoDownloadWiFiOnly") private var autoDownloadWiFiOnly = true
    @AppStorage("autoDownloadLimit") private var autoDownloadLimit = 10
    @AppStorage("autoDownloadStorageLimit") private var autoDownloadStorageLimit = 1024 // MB
    
    var body: some View {
        NavigationStack {
            Form {
                // Auto-Download Section
                Section {
                    Toggle("Enable Auto-Download", isOn: $autoDownloadEnabled)
                    
                    if autoDownloadEnabled {
                        Toggle("Wi-Fi Only", isOn: $autoDownloadWiFiOnly)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Max Concurrent Downloads")
                                .font(.subheadline)
                            
                            Stepper(value: $autoDownloadLimit, in: 1...20) {
                                Text("\(autoDownloadLimit) downloads")
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Storage Limit")
                                .font(.subheadline)
                            
                            Picker("Storage Limit", selection: $autoDownloadStorageLimit) {
                                Text("512 MB").tag(512)
                                Text("1 GB").tag(1024)
                                Text("2 GB").tag(2048)
                                Text("5 GB").tag(5120)
                                Text("10 GB").tag(10240)
                                Text("Unlimited").tag(0)
                            }
                        }
                    }
                } header: {
                    Text("Auto-Download")
                } footer: {
                    Text("Automatically download new chapters when available. Only works when connected to Wi-Fi if enabled.")
                }
                
                // Download Quality Section
                Section {
                    Picker("Download Quality", selection: .constant("High")) {
                        Text("High Quality").tag("High")
                        Text("Standard Quality").tag("Standard")
                        Text("Low Quality").tag("Low")
                    }
                } header: {
                    Text("Quality")
                } footer: {
                    Text("Higher quality uses more storage space.")
                }
                
                // Background Download Section
                Section {
                    Toggle("Background Downloads", isOn: .constant(true))
                } header: {
                    Text("Background")
                } footer: {
                    Text("Allow downloads to continue when the app is in the background.")
                }
            }
            .navigationTitle("Download Settings")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

