package com.storysphere.storyreader.model

data class FilteredView(
    val id: String,
    val userId: String,
    val name: String,
    val description: String? = null,
    val query: FilterQuery,
    val order: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

data class FilterQuery(
    val tags: List<String>? = null,
    val authors: List<String>? = null,
    val genres: List<String>? = null,
    val completionStatus: CompletionStatus? = null,
    val dateRange: DateRange? = null,
    val searchText: String? = null
)

enum class CompletionStatus {
    ALL,
    COMPLETED,
    ONGOING,
    HIATUS
}

data class DateRange(
    val startDate: Long? = null,
    val endDate: Long? = null
)

