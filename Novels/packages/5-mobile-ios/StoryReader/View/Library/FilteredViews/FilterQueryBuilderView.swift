import SwiftUI

// Filter Query Builder - Interactive controls for building FilterQuery
struct FilterQueryBuilderView: View {
    @Binding var query: FilterQuery
    
    @State private var authorId: String = ""
    @State private var seriesId: String = ""
    @State private var completionStatus: FilterQuery.CompletionStatus?
    @State private var includeProgressRange: Bool = false
    @State private var progressMin: Double = 0
    @State private var progressMax: Double = 100
    @State private var includeDateRange: Bool = false
    @State private var dateField: DateRange.DateRangeField = .addedAt
    @State private var dateStart: Date = Calendar.current.date(byAdding: .month, value: -1, to: Date()) ?? Date()
    @State private var dateEnd: Date = Date()
    @State private var requiresHighlights: Bool = false
    @State private var requiresBookmarks: Bool = false
    
    init(query: Binding<FilterQuery>) {
        _query = query
        _authorId = State(initialValue: query.wrappedValue.authorId ?? "")
        _seriesId = State(initialValue: query.wrappedValue.seriesId ?? "")
        _completionStatus = State(initialValue: query.wrappedValue.completionStatus)
        if let progress = query.wrappedValue.progressRange {
            _includeProgressRange = State(initialValue: true)
            _progressMin = State(initialValue: progress.min * 100)
            _progressMax = State(initialValue: progress.max * 100)
        }
        if let dateRange = query.wrappedValue.dateRange {
            _includeDateRange = State(initialValue: true)
            _dateField = State(initialValue: dateRange.field)
            _dateStart = State(initialValue: dateRange.start)
            _dateEnd = State(initialValue: dateRange.end)
        }
        _requiresHighlights = State(initialValue: query.wrappedValue.hasHighlights ?? false)
        _requiresBookmarks = State(initialValue: query.wrappedValue.hasBookmarks ?? false)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            TextField("Author ID", text: $authorId)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .onChange(of: authorId) { _ in updateQuery() }
            
            TextField("Series ID", text: $seriesId)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .onChange(of: seriesId) { _ in updateQuery() }
            
            Picker("Completion", selection: Binding(
                get: { completionStatus ?? .completed },
                set: { newValue in
                    completionStatus = newValue
                    updateQuery()
                })) {
                Text("Any Status").tag(FilterQuery.CompletionStatus?.none)
                ForEach(FilterQuery.CompletionStatus.allCases, id: \.self) { status in
                    Text(status.label).tag(Optional(status))
                }
            }
            .pickerStyle(.menu)
            
            Toggle("Filter by progress", isOn: $includeProgressRange)
                .onChange(of: includeProgressRange) { _ in updateQuery() }
            if includeProgressRange {
                VStack(alignment: .leading) {
                    Slider(value: $progressMin, in: 0...progressMax, step: 5) {
                        Text("Min Progress")
                    } minimumValueLabel: {
                        Text("\(Int(progressMin))%")
                    } maximumValueLabel: {
                        EmptyView()
                    }
                    .onChange(of: progressMin) { _ in updateQuery() }
                    
                    Slider(value: $progressMax, in: progressMin...100, step: 5) {
                        Text("Max Progress")
                    } minimumValueLabel: {
                        EmptyView()
                    } maximumValueLabel: {
                        Text("\(Int(progressMax))%")
                    }
                    .onChange(of: progressMax) { _ in updateQuery() }
                }
            }
            
            Toggle("Filter by date range", isOn: $includeDateRange)
                .onChange(of: includeDateRange) { _ in updateQuery() }
            if includeDateRange {
                Picker("Date Field", selection: $dateField) {
                    ForEach(DateRange.DateRangeField.allCases, id: \.self) { field in
                        Text(field.label).tag(field)
                    }
                }
                .onChange(of: dateField) { _ in updateQuery() }
                
                DatePicker("Start", selection: $dateStart, displayedComponents: .date)
                    .onChange(of: dateStart) { _ in updateQuery() }
                DatePicker("End", selection: $dateEnd, displayedComponents: .date)
                    .onChange(of: dateEnd) { _ in updateQuery() }
            }
            
            Toggle("Must contain highlights", isOn: $requiresHighlights)
                .onChange(of: requiresHighlights) { _ in updateQuery() }
            Toggle("Must contain bookmarks", isOn: $requiresBookmarks)
                .onChange(of: requiresBookmarks) { _ in updateQuery() }
        }
        .onAppear {
            updateQuery()
        }
    }
    
    private func updateQuery() {
        query = FilterQuery(
            tags: query.tags,
            authorId: authorId.isEmpty ? nil : authorId,
            seriesId: seriesId.isEmpty ? nil : seriesId,
            completionStatus: completionStatus,
            progressRange: includeProgressRange ? ProgressRange(min: progressMin / 100, max: progressMax / 100) : nil,
            dateRange: includeDateRange ? DateRange(field: dateField, start: dateStart, end: dateEnd) : nil,
            hasHighlights: requiresHighlights ? true : nil,
            hasBookmarks: requiresBookmarks ? true : nil
        )
    }
}

// MARK: - Helpers

private extension FilterQuery.CompletionStatus {
    static var allCases: [FilterQuery.CompletionStatus] {
        [.completed, .inProgress, .notStarted]
    }
    
    var label: String {
        switch self {
        case .completed: return "Completed"
        case .inProgress: return "In Progress"
        case .notStarted: return "Not Started"
        }
    }
}

private extension DateRange.DateRangeField {
    static var allCases: [DateRange.DateRangeField] {
        [.addedAt, .lastReadAt, .completedAt]
    }
    
    var label: String {
        switch self {
        case .addedAt: return "Added Date"
        case .lastReadAt: return "Last Read"
        case .completedAt: return "Completed Date"
        }
    }
}

extension FilterQuery {
    static var empty: FilterQuery {
        FilterQuery(
            tags: nil,
            authorId: nil,
            seriesId: nil,
            completionStatus: nil,
            progressRange: nil,
            dateRange: nil,
            hasHighlights: nil,
            hasBookmarks: nil
        )
    }
}


