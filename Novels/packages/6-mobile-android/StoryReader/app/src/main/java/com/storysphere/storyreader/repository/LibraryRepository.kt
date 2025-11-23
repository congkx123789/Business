package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.LibraryEntity
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.storage.SyncService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LibraryRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    // Background scope for async operations
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    // Offline-First: Load from Room first, then fetch from network
    fun getLibrary(userId: String): Flow<List<Library>> {
        // 1. Return Room Flow (emits automatically on changes)
        return database.libraryDao().getLibrary(userId)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                // 2. Fetch from network in background when Flow starts
                backgroundScope.launch {
                    graphQLService.getLibrary(userId).fold(
                        onSuccess = { remoteItems ->
                            // 3. Update Room with fresh data (triggers Room Flow to emit)
                            database.libraryDao().insertLibraryItems(remoteItems.map { it.toEntity() })
                        },
                        onFailure = { 
                            // If network fails, Room Flow will still emit local data
                            // Error already logged in GraphQLService
                        }
                    )
                }
            }
    }
    
    suspend fun addToLibrary(userId: String, storyId: String): Result<Library> {
        val pending = Library(
            id = "${userId}_$storyId",
            userId = userId,
            storyId = storyId,
            addedAt = System.currentTimeMillis(),
            syncStatus = SyncStatus.PENDING
        )

        database.libraryDao().insertLibraryItem(pending.toEntity())

        val result = graphQLService.addToLibrary(userId, storyId)
        return result.fold(
            onSuccess = { remote ->
                database.libraryDao().insertLibraryItem(remote.toEntity())
                Result.success(remote)
            },
            onFailure = { error ->
                syncService.syncLibrary(userId)
                Result.failure(error)
            }
        )
    }
    
    suspend fun removeFromLibrary(userId: String, storyId: String): Result<Boolean> {
        val result = graphQLService.removeFromLibrary(userId, storyId)
        return result.fold(
            onSuccess = {
                database.libraryDao().deleteLibraryItem(userId, storyId)
                Result.success(true)
            },
            onFailure = { error ->
                syncService.syncLibrary(userId)
                Result.failure(error)
            }
        )
    }
    
    suspend fun updateLastReadAt(userId: String, storyId: String) {
        database.libraryDao().updateLastReadAt(userId, storyId, System.currentTimeMillis())
    }
}

private fun LibraryEntity.toModel(): Library {
    return Library(
        id = id,
        userId = userId,
        storyId = storyId,
        addedAt = addedAt,
        lastReadAt = lastReadAt,
        isFavorite = isFavorite,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun Library.toEntity(): LibraryEntity {
    return LibraryEntity(
        id = id,
        userId = userId,
        storyId = storyId,
        addedAt = addedAt,
        lastReadAt = lastReadAt,
        isFavorite = isFavorite,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

