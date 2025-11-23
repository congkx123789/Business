package com.storysphere.storyreader.model

data class FilterQuery(
    val id: String? = null,
    val name: String? = null, // For saved filter presets
    val tags: List<String> = emptyList(),
    val authors: List<String> = emptyList(),
    val genres: List<String> = emptyList(),
    val completionStatus: CompletionStatus? = null,
    val dateRange: DateRange? = null,
    val sortBy: SortOption = SortOption.RECENT,
    val sortOrder: SortOrder = SortOrder.DESC
)

enum class CompletionStatus {
    COMPLETED,
    ONGOING,
    HIATUS
}

data class DateRange(
    val startDate: Long? = null,
    val endDate: Long? = null
)

enum class SortOption {
    RECENT,
    TITLE,
    PROGRESS,
    ADDED_DATE,
    RATING
}

enum class SortOrder {
    ASC,
    DESC
}
