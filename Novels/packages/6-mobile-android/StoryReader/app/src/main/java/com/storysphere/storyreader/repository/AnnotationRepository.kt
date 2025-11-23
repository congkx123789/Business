package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.AnnotationEntity
import com.storysphere.storyreader.model.Annotation
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
class AnnotationRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val syncService: SyncService
) {
    // Background scope for async operations
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    // Offline-First: Load from Room first, then fetch from network
    fun getAnnotations(userId: String, chapterId: String? = null): Flow<List<Annotation>> {
        // 1. Return Room Flow (emits automatically on changes)
        return database.annotationDao().getAnnotations(userId, chapterId)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                // 2. Fetch from network in background when Flow starts
                backgroundScope.launch {
                    graphQLService.getAnnotations(userId, chapterId).fold(
                        onSuccess = { remoteAnnotations ->
                            // 3. Update Room with fresh data (triggers Room Flow to emit)
                            database.annotationDao().insertAnnotations(remoteAnnotations.map { it.toEntity() })
                        },
                        onFailure = { 
                            // If network fails, Room Flow will still emit local data
                            // Error already logged in GraphQLService
                        }
                    )
                }
            }
    }
    
    suspend fun createAnnotation(annotation: Annotation): Result<Annotation> {
        val pending = annotation.copy(syncStatus = SyncStatus.PENDING)
        database.annotationDao().insertAnnotation(pending.toEntity())

        val result = graphQLService.createAnnotation(annotation)
        return result.fold(
            onSuccess = { remote ->
                database.annotationDao().insertAnnotation(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                Result.success(remote)
            },
            onFailure = { error ->
                syncService.syncAnnotations(annotation.userId)
                Result.failure(error)
            }
        )
    }
    
    suspend fun updateAnnotation(annotation: Annotation): Result<Annotation> {
        val pending = annotation.copy(
            updatedAt = System.currentTimeMillis(),
            syncStatus = SyncStatus.PENDING
        )
        database.annotationDao().insertAnnotation(pending.toEntity())
        
        val result = graphQLService.updateAnnotation(annotation)
        return result.fold(
            onSuccess = { remote ->
                database.annotationDao().insertAnnotation(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                Result.success(remote)
            },
            onFailure = { error ->
                syncService.syncAnnotations(annotation.userId)
                Result.failure(error)
            }
        )
    }
    
    suspend fun deleteAnnotation(annotationId: String, userId: String): Result<Boolean> {
        val result = graphQLService.deleteAnnotation(annotationId)
        return result.fold(
            onSuccess = {
                database.annotationDao().deleteAnnotation(annotationId)
                Result.success(true)
            },
            onFailure = { error ->
                syncService.syncAnnotations(userId)
                Result.failure(error)
            }
        )
    }
}

private fun AnnotationEntity.toModel(): Annotation {
    return Annotation(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        startPosition = startPosition,
        endPosition = endPosition,
        selectedText = selectedText,
        note = note,
        color = color,
        tags = tags,
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

private fun Annotation.toEntity(): AnnotationEntity {
    return AnnotationEntity(
        id = id,
        userId = userId,
        storyId = storyId,
        chapterId = chapterId,
        startPosition = startPosition,
        endPosition = endPosition,
        selectedText = selectedText,
        note = note,
        color = color,
        tags = tags,
        createdAt = createdAt,
        updatedAt = updatedAt,
        syncStatus = syncStatus,
        lastSyncedAt = lastSyncedAt
    )
}

