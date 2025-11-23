package com.storysphere.storyreader.model

enum class ExportFormat {
    JSON,
    CSV,
    MARKDOWN,
    PDF
}

enum class ExportScope {
    LIBRARY,
    ANNOTATIONS,
    READING_PROGRESS,
    ALL
}

enum class ExportDestination {
    FILE_SYSTEM,
    SHARE_SHEET,
    NOTION,
    OBSIDIAN,
    CAPACITIES
}

enum class ExportFrequency {
    DAILY,
    WEEKLY,
    MONTHLY
}

data class ExportRecord(
    val id: String,
    val userId: String,
    val format: ExportFormat,
    val scope: ExportScope,
    val destination: ExportDestination,
    val itemCount: Int,
    val fileSizeBytes: Long,
    val exportedAt: Long,
    val filePath: String?
)

data class ExportSchedule(
    val userId: String,
    val frequency: ExportFrequency,
    val includeAnnotations: Boolean,
    val includeProgress: Boolean,
    val format: ExportFormat,
    val nextRunAt: Long,
    val lastRunAt: Long?
)


