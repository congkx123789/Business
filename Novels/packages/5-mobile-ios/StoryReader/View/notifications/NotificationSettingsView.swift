import SwiftUI
import Combine

// Notification Settings View - Configure push/email settings
struct NotificationSettingsView: View {
    @State private var pushEnabled: Bool = true
    @State private var emailEnabled: Bool = false
    @State private var communityAlerts: Bool = true
    @State private var monetizationAlerts: Bool = true
    @State private var cancellables = Set<AnyCancellable>()
    
    var body: some View {
        Form {
            Section("Channels") {
                Toggle("Push Notifications", isOn: $pushEnabled)
                Toggle("Email Updates", isOn: $emailEnabled)
            }
            
            Section("Categories") {
                Toggle("Community Activity", isOn: $communityAlerts)
                Toggle("Payments & Purchases", isOn: $monetizationAlerts)
            }
            
            Section {
                Button("Save Settings") {
                    let repository = NotificationsRepository()
                    let settings = NotificationSettings(
                        pushEnabled: pushEnabled,
                        emailEnabled: emailEnabled,
                        communityAlerts: communityAlerts,
                        monetizationAlerts: monetizationAlerts
                    )
                    repository.updateNotificationSettings(settings)
                        .receive(on: DispatchQueue.main)
                        .sink(
                            receiveCompletion: { completion in
                                if case .failure(let error) = completion {
                                    print("Failed to save notification settings: \(error)")
                                }
                            },
                            receiveValue: { _ in
                                print("Notification settings saved successfully")
                            }
                        )
                        .store(in: &cancellables)
                }
            }
        }
        .navigationTitle("Notification Settings")
    }
}


