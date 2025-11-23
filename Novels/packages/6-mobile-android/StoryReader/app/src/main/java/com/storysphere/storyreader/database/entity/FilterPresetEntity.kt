package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "filter_presets",
    indices = [
        Index(value = ["userId"]),
        Index(value = ["userId", "name"], unique = true)
    ]
)
data class FilterPresetEntity(
    @PrimaryKey
    val id: String,
    val userId: String,
    val name: String,
    val filterQueryJson: String,
    val createdAt: Long,
    val lastUsedAt: Long
)

