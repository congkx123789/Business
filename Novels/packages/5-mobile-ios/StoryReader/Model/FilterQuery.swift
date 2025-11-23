import Foundation

// FilterQuery model - Query builder structure
struct FilterQuery: Codable {
    let tags: TagFilter?
    let authorId: String?
    let seriesId: String?
    let completionStatus: CompletionStatus?
    let progressRange: ProgressRange?
    let dateRange: DateRange?
    let hasHighlights: Bool?
    let hasBookmarks: Bool?
    
    enum CompletionStatus: String, Codable {
        case completed
        case inProgress = "in-progress"
        case notStarted = "not-started"
    }
    
    enum CodingKeys: String, CodingKey {
        case tags
        case authorId = "author_id"
        case seriesId = "series_id"
        case completionStatus = "completion_status"
        case progressRange = "progress_range"
        case dateRange = "date_range"
        case hasHighlights = "has_highlights"
        case hasBookmarks = "has_bookmarks"
    }
    
    // Empty filter query
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

// TagFilter model
struct TagFilter: Codable {
    let operator: TagFilterOperator
    let values: [String]
    
    enum TagFilterOperator: String, Codable {
        case AND
        case OR
        case NOT
    }
    
    enum CodingKeys: String, CodingKey {
        case `operator` = "operator"
        case values
    }
}

// ProgressRange model
struct ProgressRange: Codable {
    let min: Double
    let max: Double
}

// DateRange model
struct DateRange: Codable {
    let field: DateRangeField
    let start: Date
    let end: Date
    
    enum DateRangeField: String, Codable {
        case addedAt = "added_at"
        case lastReadAt = "last_read_at"
        case completedAt = "completed_at"
    }
}

// Extension for FilterQuery.CompletionStatus
extension FilterQuery.CompletionStatus {
    static var allCases: [FilterQuery.CompletionStatus] {
        [.completed, .inProgress, .notStarted]
    }
}

