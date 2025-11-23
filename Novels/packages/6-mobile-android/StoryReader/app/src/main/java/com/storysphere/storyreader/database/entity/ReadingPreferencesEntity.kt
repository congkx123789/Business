package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.model.BackgroundMode
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.model.SyncStatus

@Entity(tableName = "reading_preferences")
data class ReadingPreferencesEntity(
    @PrimaryKey val userId: String,
    val backgroundColor: BackgroundMode = BackgroundMode.WHITE,
    val customBackgroundColor: String? = null,
    val fontSize: Int = 16,
    val lineHeight: Float = 1.5f,
    val readingMode: ReadingMode = ReadingMode.SCROLL,
    val brightness: Int = 50,
    val tapToToggleControls: Boolean = true,
    val autoHideControls: Boolean = true,
    val controlsTimeout: Long = 3000L,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val lastSyncedAt: Long? = null
)

