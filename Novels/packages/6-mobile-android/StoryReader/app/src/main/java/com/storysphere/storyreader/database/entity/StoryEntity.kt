package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.model.StoryStatus

@Entity(tableName = "stories")
data class StoryEntity(
    @PrimaryKey val id: String,
    val title: String,
    val author: String,
    val description: String? = null,
    val coverImage: String? = null,
    val genreId: Int? = null,
    val genre: String? = null,
    val status: StoryStatus = StoryStatus.ONGOING,
    val totalChapters: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

