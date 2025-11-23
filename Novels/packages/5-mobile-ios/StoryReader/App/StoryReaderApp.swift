import SwiftUI
import BackgroundTasks

@main
struct StoryReaderApp: App {
    @Environment(\.scenePhase) private var scenePhase

    init() {
        ScheduledExportManager.shared.registerBackgroundTasks()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .onChange(of: scenePhase) { newPhase in
            if newPhase == .background {
                ScheduledExportManager.shared.schedulePendingTaskIfNeeded()
            }
        }
    }
}
