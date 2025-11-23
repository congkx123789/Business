package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "reading_stats",
    indices = [Index(value = ["userId"], unique = true)]
)
data class ReadingStatsEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val totalReadingTimeMinutes: Double,
    val totalWordsRead: Int,
    val averageWPM: Double,
    val completedStories: Int,
    val inProgressStories: Int,
    val totalStories: Int,
    val lastUpdated: Long
)

