package com.storysphere.storyreader.model

data class User(
    val id: String,
    val email: String,
    val username: String,
    val displayName: String? = null,
    val avatar: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

