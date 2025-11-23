package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.LibraryEntity
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.storage.SyncService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WishlistRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    fun getWishlist(userId: String): Flow<List<Library>> {
        return database.libraryDao().getWishlist(userId)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    graphQLService.getWishlist(userId).fold(
                        onSuccess = { remoteItems ->
                            database.libraryDao().insertLibraryItems(remoteItems.map { it.toEntity() })
                        },
                        onFailure = {
                            // Keep showing local data
                        }
                    )
                }
            }
    }
    
    suspend fun addToWishlist(userId: String, storyId: String): Result<Library> {
        val libraryItem = Library(
            id = "${userId}_$storyId",
            userId = userId,
            storyId = storyId,
            addedAt = System.currentTimeMillis(),
            syncStatus = SyncStatus.PENDING
        )
        
        // Optimistically update Room
        database.libraryDao().insertLibraryItem(libraryItem.toEntity())
        
        // Sync in background
        syncService.syncLibrary(userId)
        
        return Result.success(libraryItem)
    }
    
    suspend fun removeFromWishlist(userId: String, storyId: String): Result<Unit> {
        // Optimistically remove from Room
        database.libraryDao().deleteLibraryItem(userId, storyId)
        
        // Sync in background
        graphQLService.removeFromWishlist(userId, storyId).fold(
            onSuccess = {
                syncService.syncLibrary(userId)
            },
            onFailure = {
                // Keep removed locally
            }
        )
        
        return Result.success(Unit)
    }
}

private fun LibraryEntity.toModel(): Library = Library(
    id = id,
    userId = userId,
    storyId = storyId,
    addedAt = addedAt,
    lastReadAt = lastReadAt,
    isFavorite = isFavorite,
    syncStatus = syncStatus,
    lastSyncedAt = lastSyncedAt
)

private fun Library.toEntity(): LibraryEntity = LibraryEntity(
    id = id,
    userId = userId,
    storyId = storyId,
    addedAt = addedAt,
    lastReadAt = lastReadAt,
    isFavorite = isFavorite,
    syncStatus = syncStatus,
    lastSyncedAt = lastSyncedAt
)
