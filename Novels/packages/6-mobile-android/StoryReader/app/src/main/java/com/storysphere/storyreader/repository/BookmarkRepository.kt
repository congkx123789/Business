package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.BookmarkEntity
import com.storysphere.storyreader.model.Bookmark
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
class BookmarkRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    // Background scope for async operations
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    // Offline-First: Load from Room first, then fetch from network
    fun getBookmarks(userId: String, storyId: String? = null): Flow<List<Bookmark>> {
        // 1. Return Room Flow (emits automatically on changes)
        return database.bookmarkDao().getBookmarks(userId, storyId)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                // 2. Fetch from network in background when Flow starts
                backgroundScope.launch {
                    graphQLService.getBookmarks(userId, storyId).fold(
                        onSuccess = { remoteBookmarks ->
                            // 3. Update Room with fresh data (triggers Room Flow to emit)
                            database.bookmarkDao().insertBookmarks(remoteBookmarks.map { it.toEntity() })
                        },
                        onFailure = { 
                            // If network fails, Room Flow will still emit local data
                            // Error already logged in GraphQLService
                        }
                    )
                }
            }
    }
    
    suspend fun createBookmark(bookmark: Bookmark): Result<Bookmark> {
        val pending = bookmark.copy(syncStatus = SyncStatus.PENDING)
        database.bookmarkDao().insertBookmark(pending.toEntity())

        val result = graphQLService.createBookmark(bookmark)
        return result.fold(
            onSuccess = { remote ->
                database.bookmarkDao().insertBookmark(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                Result.success(remote)
            },
            onFailure = { error ->
                syncService.syncBookmarks(bookmark.userId)
                Result.failure(error)
            }
        )
    }
    
    suspend fun deleteBookmark(bookmarkId: String, userId: String): Result<Boolean> {
        val result = graphQLService.deleteBookmark(bookmarkId)
        return result.fold(
            onSuccess = {
                database.bookmarkDao().deleteBookmark(bookmarkId)
                Result.success(true)
            },
            onFailure = { error ->
                syncService.syncBookmarks(userId)
                Result.failure(error)
            }
        )
    }
}

private fun BookmarkEntity.toModel(): Bookmark {
    return Bookmark(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        position = position,
        note = note,
        createdAt = createdAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun Bookmark.toEntity(): BookmarkEntity {
    return BookmarkEntity(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        position = position,
        note = note,
        createdAt = createdAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

