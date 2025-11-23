import SwiftUI

// Scheduled Export View - Configure automatic exports
struct ScheduledExportView: View {
    let userId: String

    @State private var frequency: Frequency = .weekly
    @State private var includeAnnotations = true
    @State private var includeProgress = true
    @State private var nextRunDate = Date()
    @State private var currentConfiguration: ScheduledExportManager.Configuration?
    @State private var alertMessage: String?
    @State private var showingAlert = false
    
    private let scheduler = ScheduledExportManager.shared
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
    
    enum Frequency: String, CaseIterable, Identifiable {
        case daily
        case weekly
        case monthly
        
        var id: String { rawValue }
        
        var label: String {
            rawValue.capitalized
        }
    }
    
    var body: some View {
        Form {
            scheduleSummarySection
            frequencySection
            includeSection
            dateSection
            actionSection
        }
        .navigationTitle("Scheduled Export")
        .task {
            loadCurrentConfiguration()
        }
        .alert("Scheduled Export", isPresented: $showingAlert, actions: {
            Button("OK", role: .cancel) { }
        }, message: {
            Text(alertMessage ?? "")
        })
    }
    
    private var scheduleSummarySection: some View {
        Section("Current schedule") {
            if let configuration = currentConfiguration {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Frequency: \(configuration.frequency.rawValue.capitalized)")
                    Text("Next run: \(dateFormatter.string(from: configuration.nextRunDate))")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    if let lastRun = configuration.lastRunDate {
                        Text("Last run: \(dateFormatter.string(from: lastRun))")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            } else {
                Text("No scheduled exports yet.")
                    .foregroundColor(.secondary)
            }
        }
    }

    private var frequencySection: some View {
        Section("Frequency") {
            Picker("Run every", selection: $frequency) {
                ForEach(Frequency.allCases) { option in
                    Text(option.label).tag(option)
                }
            }
            .pickerStyle(.segmented)
        }
    }

    private var includeSection: some View {
        Section("Include") {
            Toggle("Annotations", isOn: $includeAnnotations)
            Toggle("Reading progress", isOn: $includeProgress)
        }
    }

    private var dateSection: some View {
        Section("Next export") {
            DatePicker("Date & Time", selection: $nextRunDate, displayedComponents: [.date, .hourAndMinute])
        }
    }

    private var actionSection: some View {
        Section {
            Button("Schedule Export") {
                scheduleTask()
            }
        }
    }

    private func scheduleTask() {
        do {
            try scheduler.scheduleExport(
                userId: userId,
                frequency: ScheduledExportManager.Configuration.Frequency(rawValue: frequency.rawValue) ?? .weekly,
                includeAnnotations: includeAnnotations,
                includeProgress: includeProgress,
                time: nextRunDate
            )
            alertMessage = "Scheduled export for \(dateFormatter.string(from: nextRunDate))."
            showingAlert = true
            loadCurrentConfiguration()
        } catch {
            alertMessage = error.localizedDescription
            showingAlert = true
        }
    }

    private func loadCurrentConfiguration() {
        currentConfiguration = scheduler.currentConfiguration()
    }
}


