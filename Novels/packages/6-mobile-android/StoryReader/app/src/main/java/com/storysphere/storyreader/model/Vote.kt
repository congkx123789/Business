package com.storysphere.storyreader.model

data class Vote(
    val id: String,
    val userId: String,
    val storyId: String,
    val voteType: VoteType,
    val votes: Int, // Number of votes cast
    val month: Int, // Month (1-12)
    val year: Int,
    val createdAt: Long = System.currentTimeMillis()
)

enum class VoteType {
    POWER_STONE,    // Daily free votes from gamification
    MONTHLY_VOTE    // VIP guaranteed votes
}

data class StoryVoteStats(
    val storyId: String,
    val totalVotes: Int,
    val powerStoneVotes: Int,
    val monthlyVotes: Int,
    val currentMonth: Int,
    val currentYear: Int
)
