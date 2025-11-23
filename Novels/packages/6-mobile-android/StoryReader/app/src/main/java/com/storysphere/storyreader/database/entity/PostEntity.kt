package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.storysphere.storyreader.database.converter.StringListConverter
import androidx.room.TypeConverters

@Entity(tableName = "posts")
@TypeConverters(StringListConverter::class)
data class PostEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val content: String,
    val images: List<String> = emptyList(),
    val storyId: String? = null,
    val likes: Int = 0,
    val comments: Int = 0,
    val shares: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

