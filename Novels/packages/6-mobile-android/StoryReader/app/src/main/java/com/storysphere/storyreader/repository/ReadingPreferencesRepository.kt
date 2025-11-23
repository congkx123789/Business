package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.ReadingPreferencesEntity
import com.storysphere.storyreader.model.ReadingPreferences
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.storage.SyncService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReadingPreferencesRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    // Offline-First: Load from Room first, then fetch from network
    fun getPreferences(userId: String): Flow<ReadingPreferences?> = flow {
        // 1. Load from Room first (instant)
        val localPreferences = database.readingPreferencesDao().getPreferences(userId)
        localPreferences?.let { emit(it.toModel()) }
        
        // 2. Fetch from network in background (always refresh for cross-device sync)
        graphQLService.getReadingPreferences(userId).fold(
            onSuccess = { remotePreferences ->
                remotePreferences?.let {
                    // 3. Update Room with fresh data
                    database.readingPreferencesDao().insertPreferences(it.toEntity())
                    emit(it)
                }
            },
            onFailure = { 
                // If network fails and we have local data, keep showing it
                // Error already logged in GraphQLService
            }
        )
    }
    
    suspend fun updatePreferences(preferences: ReadingPreferences): Result<ReadingPreferences> {
        val pending = preferences.copy(
            syncStatus = SyncStatus.PENDING,
            lastSyncedAt = null
        )
        database.readingPreferencesDao().insertPreferences(pending.toEntity())

        val result = graphQLService.updateReadingPreferences(preferences)
        return result.fold(
            onSuccess = { remote ->
                database.readingPreferencesDao().insertPreferences(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                Result.success(remote)
            },
            onFailure = { error ->
                syncService.syncReadingPreferences(preferences.userId)
                Result.failure(error)
            }
        )
    }
}

private fun ReadingPreferencesEntity.toModel(): ReadingPreferences {
    return ReadingPreferences(
        userId = userId,
        backgroundColor = backgroundColor,
        customBackgroundColor = customBackgroundColor,
        fontSize = fontSize,
        lineHeight = lineHeight,
        readingMode = readingMode,
        brightness = brightness,
        tapToToggleControls = tapToToggleControls,
        autoHideControls = autoHideControls,
        controlsTimeout = controlsTimeout,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun ReadingPreferences.toEntity(): ReadingPreferencesEntity {
    return ReadingPreferencesEntity(
        userId = userId,
        backgroundColor = backgroundColor,
        customBackgroundColor = customBackgroundColor,
        fontSize = fontSize,
        lineHeight = lineHeight,
        readingMode = readingMode,
        brightness = brightness,
        tapToToggleControls = tapToToggleControls,
        autoHideControls = autoHideControls,
        controlsTimeout = controlsTimeout,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

