package com.storysphere.storyreader.repository

import com.storysphere.storyreader.model.ActivityFeed
import com.storysphere.storyreader.model.ChallengeProgress
import com.storysphere.storyreader.model.ReadingGoal
import com.storysphere.storyreader.model.ReadingStatistics
import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReadingChallengesRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun getChallengeProgress(challengeId: String): ChallengeProgress =
        graphQLService.getChallengeProgress(challengeId).getOrThrow()

    suspend fun getFriendProgress(challengeId: String) =
        graphQLService.getFriendChallengeProgress(challengeId).getOrThrow()

    suspend fun updateProgress(challengeId: String, progress: Int): Boolean =
        graphQLService.updateReadingChallengeProgress(challengeId, progress).getOrThrow()

    suspend fun setReadingGoal(
        goalType: String,
        target: Int,
        timeRange: String,
        startDate: String,
        endDate: String
    ): ReadingGoal = graphQLService
        .setReadingGoal(goalType, target, timeRange, startDate, endDate)
        .getOrThrow()

    suspend fun getActivityFeed(page: Int = 1, limit: Int = 20): ActivityFeed =
        graphQLService.getActivityFeed(page, limit).getOrThrow()

    suspend fun getReadingStatistics(): ReadingStatistics =
        graphQLService.getReadingStatistics().getOrThrow()
}

