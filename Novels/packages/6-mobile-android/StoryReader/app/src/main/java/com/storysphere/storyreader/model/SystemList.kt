package com.storysphere.storyreader.model

data class SystemList(
    val id: String,
    val userId: String,
    val type: SystemListType,
    val storyIds: List<String> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

enum class SystemListType {
    FAVORITES,          // Favorite stories
    TO_READ,            // Stories to read later
    HAVE_READ,          // Completed stories
    CURRENTLY_READING,  // Currently reading
    RECENTLY_ADDED      // Recently added to library
}
