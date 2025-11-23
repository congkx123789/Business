package com.storysphere.storyreader.model

data class ReviewRatings(
    val plot: Int,
    val characters: Int,
    val worldBuilding: Int,
    val writingStyle: Int
) {
    val average: Float =
        listOf(plot, characters, worldBuilding, writingStyle).average().toFloat()
}

data class Review(
    val id: String,
    val storyId: String,
    val userId: String,
    val username: String,
    val avatarUrl: String? = null,
    val content: String,
    val ratings: ReviewRatings,
    val likeCount: Int = 0,
    val dislikeCount: Int = 0,
    val createdAt: Long = System.currentTimeMillis(),
    val isAuthor: Boolean = false
)

