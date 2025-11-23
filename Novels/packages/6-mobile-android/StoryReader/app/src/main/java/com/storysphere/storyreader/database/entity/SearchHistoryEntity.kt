package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "search_history",
    indices = [
        Index(value = ["userId", "query", "queryType"], unique = true),
        Index(value = ["userId", "searchedAt"])
    ]
)
data class SearchHistoryEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val query: String,
    val queryType: String, // STORY, CHAPTER, ANNOTATION, SETTING
    val searchedAt: Long
)

