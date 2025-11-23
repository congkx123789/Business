package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.ReadingProgressEntity
import com.storysphere.storyreader.model.ReadingProgress
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.storage.SyncService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReadingProgressRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    // Offline-First: Load from Room first, then fetch from network
    fun getProgress(userId: String, storyId: String): Flow<ReadingProgress?> = flow {
        // 1. Load from Room first (instant)
        val localProgress = database.readingProgressDao().getProgress(userId, storyId)
        localProgress?.let { emit(it.toModel()) }
        
        // 2. Fetch from network in background (always refresh)
        graphQLService.getReadingProgress(userId, storyId).fold(
            onSuccess = { remoteProgress ->
                remoteProgress?.let {
                    // 3. Update Room with fresh data
                    database.readingProgressDao().insertProgress(it.toEntity())
                    emit(it)
                }
            },
            onFailure = { 
                // If network fails and we have local data, keep showing it
                // Error already logged in GraphQLService
            }
        )
    }
    
    suspend fun updateProgress(progress: ReadingProgress): Result<ReadingProgress> {
        val pending = progress.copy(syncStatus = SyncStatus.PENDING)
        database.readingProgressDao().insertProgress(pending.toEntity())

        val result = graphQLService.updateReadingProgress(progress)
        return result.fold(
            onSuccess = { remote ->
                database.readingProgressDao().insertProgress(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                Result.success(remote)
            },
            onFailure = { error ->
                syncService.syncReadingProgress(progress.userId, progress.storyId)
                Result.failure(error)
            }
        )
    }
}

private fun ReadingProgressEntity.toModel(): ReadingProgress {
    return ReadingProgress(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        position = position,
        progress = progress,
        wordsPerMinute = wordsPerMinute,
        readingTime = readingTime,
        lastReadAt = lastReadAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun ReadingProgress.toEntity(): ReadingProgressEntity {
    return ReadingProgressEntity(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        position = position,
        progress = progress,
        wordsPerMinute = wordsPerMinute,
        readingTime = readingTime,
        lastReadAt = lastReadAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

