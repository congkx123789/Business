package com.storysphere.storyreader.utils.mobile.stats

import com.storysphere.storyreader.model.ReadingProgress
import com.storysphere.storyreader.model.ReadingStats
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StatsAggregator @Inject constructor(
    private val calculator: ReadingStatsCalculator,
    private val storage: StatsStorage
) {
    suspend fun aggregateAndSave(
        userId: String,
        progressList: List<ReadingProgress>
    ): ReadingStats = withContext(Dispatchers.IO) {
        val stats = calculator.aggregateStats(progressList)
        storage.saveStats(userId, stats)
        stats
    }

    suspend fun updateStats(
        userId: String,
        newProgress: ReadingProgress
    ) {
        withContext(Dispatchers.IO) {
            // Get existing stats
            val existingStats = storage.getStats(userId)
            
            // Recalculate with new progress
            // In production, you'd fetch all progress records and recalculate
            // For now, this is a simplified version
            existingStats?.let { stats ->
                val updatedStats = stats.copy(
                    totalReadingTimeMinutes = (stats.totalReadingTimeMinutes ?: 0.0) + (newProgress.readingTimeMinutes ?: 0.0),
                    totalWordsRead = (stats.totalWordsRead ?: 0) + (newProgress.wordsRead ?: 0)
                )
                storage.saveStats(userId, updatedStats)
            }
        }
    }
}

