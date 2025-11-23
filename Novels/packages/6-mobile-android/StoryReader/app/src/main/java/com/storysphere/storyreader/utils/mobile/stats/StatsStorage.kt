package com.storysphere.storyreader.utils.mobile.stats

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.dao.ReadingStatsDao
import com.storysphere.storyreader.database.entity.ReadingStatsEntity
import com.storysphere.storyreader.model.ReadingStats
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StatsStorage @Inject constructor(
    private val database: AppDatabase
) {
    private val dao: ReadingStatsDao
        get() = database.readingStatsDao()

    fun observeStats(userId: String): Flow<ReadingStats?> {
        return dao.observeStats(userId).map { entity ->
            entity?.toModel()
        }
    }

    suspend fun saveStats(userId: String, stats: ReadingStats) {
        withContext(Dispatchers.IO) {
            dao.insertOrUpdate(stats.toEntity(userId))
        }
    }

    suspend fun getStats(userId: String): ReadingStats? {
        return withContext(Dispatchers.IO) {
            dao.getStats(userId)?.toModel()
        }
    }

    suspend fun clearStats(userId: String) {
        withContext(Dispatchers.IO) {
            dao.deleteByUserId(userId)
        }
    }
}

private fun ReadingStatsEntity.toModel(): ReadingStats {
    return ReadingStats(
        totalReadingTimeMinutes = totalReadingTimeMinutes,
        totalWordsRead = totalWordsRead,
        averageWPM = averageWPM,
        completedStories = completedStories,
        inProgressStories = inProgressStories,
        totalStories = totalStories
    )
}

private fun ReadingStats.toEntity(userId: String): ReadingStatsEntity {
    return ReadingStatsEntity(
        id = generateId(),
        userId = userId,
        totalReadingTimeMinutes = totalReadingTimeMinutes ?: 0.0,
        totalWordsRead = totalWordsRead ?: 0,
        averageWPM = averageWPM ?: 0.0,
        completedStories = completedStories ?: 0,
        inProgressStories = inProgressStories ?: 0,
        totalStories = totalStories ?: 0,
        lastUpdated = System.currentTimeMillis()
    )
}

private fun generateId(): String {
    return java.util.UUID.randomUUID().toString()
}

