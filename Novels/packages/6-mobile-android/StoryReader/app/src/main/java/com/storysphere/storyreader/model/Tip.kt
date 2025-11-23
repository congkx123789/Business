package com.storysphere.storyreader.model

data class Tip(
    val id: String,
    val userId: String,
    val storyId: String,
    val authorId: String,
    val amount: Int, // Amount in points
    val message: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

data class AuthorTippingStats(
    val authorId: String,
    val totalTips: Int,
    val tipCount: Int,
    val topSupporters: List<TipSupporter>
)

data class TipSupporter(
    val userId: String,
    val username: String,
    val avatar: String? = null,
    val totalAmount: Int,
    val tipCount: Int
)
