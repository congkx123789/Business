package com.storysphere.storyreader.model

data class ReadingPreferences(
    val userId: String,
    val backgroundColor: BackgroundMode = BackgroundMode.WHITE,
    val customBackgroundColor: String? = null,
    val fontSize: Int = 16, // in sp
    val lineHeight: Float = 1.5f,
    val readingMode: ReadingMode = ReadingMode.SCROLL,
    val brightness: Int = 50, // 0-100
    val tapToToggleControls: Boolean = true,
    val autoHideControls: Boolean = true,
    val controlsTimeout: Long = 3000L, // milliseconds
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

enum class BackgroundMode {
    WHITE,
    BLACK,
    SEPIA,
    EYE_PROTECTION,
    CUSTOM
}

enum class ReadingMode {
    SCROLL,
    PAGE_TURN
}

