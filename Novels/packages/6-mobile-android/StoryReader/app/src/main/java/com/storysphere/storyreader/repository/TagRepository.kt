package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.TagEntity
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.model.Tag
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TagRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    // Offline-First: Load from Room first, sync in background
    fun getTags(userId: String): Flow<List<Tag>> {
        return database.tagDao().getTags(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }
    
    fun getRootTags(userId: String): Flow<List<Tag>> {
        return database.tagDao().getRootTags(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }
    
    fun getChildTags(userId: String, parentId: String): Flow<List<Tag>> {
        return database.tagDao().getChildTags(userId, parentId).map { entities ->
            entities.map { it.toModel() }
        }
    }
    
    suspend fun createTag(tag: Tag): Result<Tag> {
        // 1. Add to Room instantly (offline-first)
        val tagWithSync = tag.copy(syncStatus = SyncStatus.PENDING)
        database.tagDao().insertTag(tagWithSync.toEntity())
        
        // 2. Sync to backend in background
        // TODO: Implement sync
        
        return Result.success(tagWithSync)
    }
    
    suspend fun updateTag(tag: Tag): Result<Tag> {
        val updated = tag.copy(syncStatus = SyncStatus.PENDING)
        database.tagDao().insertTag(updated.toEntity())
        return Result.success(updated)
    }
    
    suspend fun deleteTag(tagId: String): Result<Boolean> {
        database.tagDao().deleteTag(tagId)
        return Result.success(true)
    }
}

private fun TagEntity.toModel(): Tag {
    return Tag(
        id = id,
        userId = userId,
        name = name,
        color = color,
        icon = icon,
        parentId = parentId,
        order = order,
        createdAt = createdAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun Tag.toEntity(): TagEntity {
    return TagEntity(
        id = id,
        userId = userId,
        name = name,
        color = color,
        icon = icon,
        parentId = parentId,
        order = order,
        createdAt = createdAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

