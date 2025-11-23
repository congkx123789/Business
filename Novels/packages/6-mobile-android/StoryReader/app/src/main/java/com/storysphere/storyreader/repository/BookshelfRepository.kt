package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.BookshelfEntity
import com.storysphere.storyreader.model.Bookshelf
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.storage.SyncService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BookshelfRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    // Offline-First: Load from Room first, sync in background
    fun getBookshelves(userId: String): Flow<List<Bookshelf>> {
        return database.bookshelfDao().getBookshelves(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }
    
    suspend fun createBookshelf(bookshelf: Bookshelf): Result<Bookshelf> {
        // 1. Add to Room instantly (offline-first)
        val bookshelfWithSync = bookshelf.copy(syncStatus = SyncStatus.PENDING)
        database.bookshelfDao().insertBookshelf(bookshelfWithSync.toEntity())
        
        // 2. Sync to backend in background
        // TODO: Implement sync
        
        return Result.success(bookshelfWithSync)
    }
    
    suspend fun updateBookshelf(bookshelf: Bookshelf): Result<Bookshelf> {
        val updated = bookshelf.copy(
            updatedAt = System.currentTimeMillis(),
            syncStatus = SyncStatus.PENDING
        )
        database.bookshelfDao().insertBookshelf(updated.toEntity())
        return Result.success(updated)
    }
    
    suspend fun deleteBookshelf(bookshelfId: String): Result<Boolean> {
        database.bookshelfDao().deleteBookshelf(bookshelfId)
        return Result.success(true)
    }
    
    suspend fun addStoryToBookshelf(bookshelfId: String, storyId: String) {
        val bookshelf = database.bookshelfDao().getBookshelf(bookshelfId)
        bookshelf?.let {
            val updatedStoryIds = it.storyIds.toMutableList().apply {
                if (!contains(storyId)) add(storyId)
            }
            database.bookshelfDao().updateStoryIds(
                bookshelfId,
                updatedStoryIds,
                System.currentTimeMillis()
            )
        }
    }
    
    suspend fun removeStoryFromBookshelf(bookshelfId: String, storyId: String) {
        val bookshelf = database.bookshelfDao().getBookshelf(bookshelfId)
        bookshelf?.let {
            val updatedStoryIds = it.storyIds.toMutableList().apply {
                remove(storyId)
            }
            database.bookshelfDao().updateStoryIds(
                bookshelfId,
                updatedStoryIds,
                System.currentTimeMillis()
            )
        }
    }
}

private fun BookshelfEntity.toModel(): Bookshelf {
    return Bookshelf(
        id = id,
        userId = userId,
        name = name,
        description = description,
        color = color,
        icon = icon,
        storyIds = storyIds,
        order = order,
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun Bookshelf.toEntity(): BookshelfEntity {
    return BookshelfEntity(
        id = id,
        userId = userId,
        name = name,
        description = description,
        color = color,
        icon = icon,
        storyIds = storyIds,
        order = order,
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

