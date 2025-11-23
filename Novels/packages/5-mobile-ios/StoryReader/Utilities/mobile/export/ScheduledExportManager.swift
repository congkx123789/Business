import Foundation
import BackgroundTasks
import Combine

/// ScheduledExportManager
/// Coordinates scheduled export jobs via BGTaskScheduler + ExportImportRepository
final class ScheduledExportManager {
    static let shared = ScheduledExportManager()

    struct Configuration: Codable {
        enum Frequency: String, Codable, CaseIterable {
            case daily
            case weekly
            case monthly

            var dateComponent: DateComponents {
                switch self {
                case .daily:
                    return DateComponents(day: 1)
                case .weekly:
                    return DateComponents(day: 7)
                case .monthly:
                    return DateComponents(month: 1)
                }
            }
        }

        var userId: String
        var frequency: Frequency
        var includeAnnotations: Bool
        var includeProgress: Bool
        var preferredTime: DateComponents
        var nextRunDate: Date
        var lastRunDate: Date?
    }

    enum ScheduledExportError: LocalizedError {
        case missingUserIdentifier
        case schedulingUnavailable

        var errorDescription: String? {
            switch self {
            case .missingUserIdentifier:
                return "Unable to schedule export because the user identifier is missing."
            case .schedulingUnavailable:
                return "Background task scheduling is unavailable at this time."
            }
        }
    }

    // MARK: - Private properties

    private let taskIdentifier = "com.storyreader.scheduled.export"
    private let storageKey = "scheduled-export-configuration"
    private let repository = ExportImportRepository()
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    private var didRegister = false

    private init() {}

    // MARK: - Public API

    func registerBackgroundTasks() {
        guard !didRegister else { return }

        BGTaskScheduler.shared.register(forTaskWithIdentifier: taskIdentifier, using: nil) { [weak self] task in
            self?.handleProcessingTask(task)
        }

        didRegister = true
    }

    func currentConfiguration() -> Configuration? {
        guard
            let data = UserDefaults.standard.data(forKey: storageKey),
            let configuration = try? decoder.decode(Configuration.self, from: data)
        else {
            return nil
        }

        return configuration
    }

    func scheduleExport(
        userId: String,
        frequency: Configuration.Frequency,
        includeAnnotations: Bool,
        includeProgress: Bool,
        time: Date
    ) throws {
        guard !userId.isEmpty else {
            throw ScheduledExportError.missingUserIdentifier
        }

        var configuration = Configuration(
            userId: userId,
            frequency: frequency,
            includeAnnotations: includeAnnotations,
            includeProgress: includeProgress,
            preferredTime: Calendar.current.dateComponents([.hour, .minute], from: time),
            nextRunDate: normalizedExecutionDate(from: time, frequency: frequency),
            lastRunDate: nil
        )

        try persist(configuration)
        try submitTask(for: configuration)
    }

    func schedulePendingTaskIfNeeded() {
        guard let configuration = currentConfiguration() else { return }
        try? submitTask(for: configuration)
    }

    // MARK: - Private helpers

    private func handleProcessingTask(_ task: BGTask) {
        guard let processingTask = task as? BGProcessingTask else {
            task.setTaskCompleted(success: false)
            return
        }

        guard var configuration = currentConfiguration() else {
            processingTask.setTaskCompleted(success: false)
            return
        }

        processingTask.expirationHandler = {
            processingTask.setTaskCompleted(success: false)
        }

        Task {
            do {
                try await performExport(with: configuration)
                configuration.lastRunDate = Date()
                configuration.nextRunDate = advance(date: configuration.nextRunDate, frequency: configuration.frequency)
                try persist(configuration)
                try submitTask(for: configuration)
                processingTask.setTaskCompleted(success: true)
            } catch {
                processingTask.setTaskCompleted(success: false)
            }
        }
    }

    private func performExport(with configuration: Configuration) async throws {
        let scope = resolveScope(
            includeAnnotations: configuration.includeAnnotations,
            includeProgress: configuration.includeProgress
        )

        _ = try await repository.exportAsync(
            userId: configuration.userId,
            format: .json,
            scope: scope,
            itemIds: nil
        )
    }

    private func resolveScope(includeAnnotations: Bool, includeProgress: Bool) -> ExportImportViewModel.ExportScope {
        switch (includeAnnotations, includeProgress) {
        case (true, true):
            return .all
        case (true, false):
            return .annotations
        case (false, true):
            return .readingProgress
        default:
            return .library
        }
    }

    private func normalizedExecutionDate(from selectedDate: Date, frequency: Configuration.Frequency) -> Date {
        var nextDate = selectedDate
        let now = Date()
        while nextDate <= now {
            nextDate = advance(date: nextDate, frequency: frequency)
        }
        return nextDate
    }

    private func advance(date: Date, frequency: Configuration.Frequency) -> Date {
        let calendar = Calendar.current
        let components = frequency.dateComponent
        return calendar.date(byAdding: components, to: date) ?? date.addingTimeInterval(components.timeIntervalFallback)
    }

    private func persist(_ configuration: Configuration) throws {
        let data = try encoder.encode(configuration)
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func submitTask(for configuration: Configuration) throws {
        BGTaskScheduler.shared.cancel(taskRequestWithIdentifier: taskIdentifier)

        let request = BGProcessingTaskRequest(identifier: taskIdentifier)
        request.requiresNetworkConnectivity = true
        request.requiresExternalPower = false
        request.earliestBeginDate = configuration.nextRunDate

        do {
            try BGTaskScheduler.shared.submit(request)
        } catch {
            throw ScheduledExportError.schedulingUnavailable
        }
    }
}

// MARK: - Helpers

private extension DateComponents {
    /// Approximate interval used when Calendar calculation fails
    var timeIntervalFallback: TimeInterval {
        if let day = day {
            return TimeInterval(day * 86_400)
        }
        if let month = month {
            return TimeInterval(month * 30 * 86_400)
        }
        return 86_400
    }
}

private extension ExportImportRepository {
    func exportAsync(
        userId: String,
        format: ExportImportViewModel.ExportFormat,
        scope: ExportImportViewModel.ExportScope,
        itemIds: [String]? = nil
    ) async throws -> ExportImportViewModel.ExportRecord {
        try await withCheckedThrowingContinuation { continuation in
            var cancellable: AnyCancellable?
            cancellable = export(userId: userId, format: format, scope: scope, itemIds: itemIds)
                .sink(
                    receiveCompletion: { completion in
                        if case .failure(let error) = completion {
                            continuation.resume(throwing: error)
                        }
                        cancellable?.cancel()
                        cancellable = nil
                    },
                    receiveValue: { record in
                        continuation.resume(returning: record)
                        cancellable?.cancel()
                        cancellable = nil
                    }
                )
        }
    }
}


