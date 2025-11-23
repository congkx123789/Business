package com.storysphere.storyreader.model

import java.time.OffsetDateTime

data class ReadingChallenge(
    val id: String,
    val name: String,
    val description: String?,
    val challengeType: String,
    val goal: Int,
    val goalType: String,
    val timeRange: String,
    val startDate: OffsetDateTime,
    val endDate: OffsetDateTime,
    val progress: Int,
    val status: String,
    val isPublic: Boolean
)

data class ChallengeParticipant(
    val userId: String,
    val progress: Int,
    val joinedAt: OffsetDateTime,
    val updatedAt: OffsetDateTime
)

data class ChallengeProgress(
    val challenge: ReadingChallenge,
    val participants: List<ChallengeParticipant>
)

data class ReadingGoal(
    val id: String,
    val goalType: String,
    val target: Int,
    val current: Int,
    val timeRange: String,
    val startDate: OffsetDateTime,
    val endDate: OffsetDateTime,
    val status: String
)

data class ActivityFeedItem(
    val id: String,
    val activityType: String,
    val timestamp: OffsetDateTime,
    val storyId: String?,
    val chapterId: String?,
    val metadata: Map<String, String>?
)

data class ActivityFeed(
    val items: List<ActivityFeedItem>,
    val total: Int,
    val page: Int,
    val limit: Int
)

data class ReadingStatistics(
    val activityCounts: List<ActivityCount>,
    val activeGoals: List<ReadingGoal>
) {
    data class ActivityCount(
        val activityType: String,
        val count: Int
    )
}

