package com.storysphere.storyreader.model

data class Post(
    val id: String,
    val userId: String,
    val content: String,
    val images: List<String> = emptyList(),
    val likes: Int = 0,
    val comments: Int = 0,
    val shares: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

