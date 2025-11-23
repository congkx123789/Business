package com.storysphere.storyreader.utils.mobile.stats

import com.storysphere.storyreader.model.ReadingProgress
import com.storysphere.storyreader.model.ReadingStats
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReadingStatsCalculator @Inject constructor() {
    suspend fun calculateWPM(
        wordsRead: Int,
        timeSpentMinutes: Double
    ): Double = withContext(Dispatchers.Default) {
        if (timeSpentMinutes <= 0) return@withContext 0.0
        wordsRead / timeSpentMinutes
    }

    suspend fun calculateReadingTime(
        progressList: List<ReadingProgress>
    ): ReadingTimeStats = withContext(Dispatchers.Default) {
        val totalMinutes = progressList.sumOf { it.readingTimeMinutes ?: 0.0 }
        val totalWords = progressList.sumOf { it.wordsRead ?: 0 }
        val averageWPM = if (totalMinutes > 0) totalWords / totalMinutes else 0.0
        
        ReadingTimeStats(
            totalMinutes = totalMinutes,
            totalHours = totalMinutes / 60.0,
            totalDays = totalMinutes / (60.0 * 24.0),
            averageWPM = averageWPM,
            totalWords = totalWords
        )
    }

    suspend fun calculateProgressStats(
        progressList: List<ReadingProgress>
    ): ProgressStats = withContext(Dispatchers.Default) {
        val completed = progressList.count { it.isCompleted == true }
        val inProgress = progressList.count { it.isCompleted == false && it.progressPercent ?: 0.0 > 0.0 }
        val notStarted = progressList.count { (it.progressPercent ?: 0.0) == 0.0 }
        val total = progressList.size
        
        val averageProgress = if (total > 0) {
            progressList.mapNotNull { it.progressPercent }.average()
        } else {
            0.0
        }
        
        ProgressStats(
            total = total,
            completed = completed,
            inProgress = inProgress,
            notStarted = notStarted,
            averageProgress = averageProgress
        )
    }

    suspend fun aggregateStats(
        progressList: List<ReadingProgress>
    ): ReadingStats = withContext(Dispatchers.Default) {
        val readingTime = calculateReadingTime(progressList)
        val progress = calculateProgressStats(progressList)
        
        ReadingStats(
            totalReadingTimeMinutes = readingTime.totalMinutes,
            totalWordsRead = readingTime.totalWords,
            averageWPM = readingTime.averageWPM,
            completedStories = progress.completed,
            inProgressStories = progress.inProgress,
            totalStories = progress.total
        )
    }
}

data class ReadingTimeStats(
    val totalMinutes: Double,
    val totalHours: Double,
    val totalDays: Double,
    val averageWPM: Double,
    val totalWords: Int
)

data class ProgressStats(
    val total: Int,
    val completed: Int,
    val inProgress: Int,
    val notStarted: Int,
    val averageProgress: Double
)

