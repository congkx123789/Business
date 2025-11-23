package com.storysphere.storyreader.model

data class Group(
    val id: String,
    val name: String,
    val description: String? = null,
    val coverImage: String? = null,
    val memberCount: Int = 0,
    val postCount: Int = 0,
    val isPrivate: Boolean = false,
    val createdAt: Long = System.currentTimeMillis()
)

