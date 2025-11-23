package com.storysphere.storyreader.storage

import android.util.Log
import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.AnnotationEntity
import com.storysphere.storyreader.database.entity.BookmarkEntity
import com.storysphere.storyreader.database.entity.LibraryEntity
import com.storysphere.storyreader.database.entity.ReadingPreferencesEntity
import com.storysphere.storyreader.database.entity.ReadingProgressEntity
import com.storysphere.storyreader.model.Annotation
import com.storysphere.storyreader.model.Bookmark
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.ReadingPreferences
import com.storysphere.storyreader.model.ReadingProgress
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncService @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val ioDispatcher = Dispatchers.IO
    private val syncScope = CoroutineScope(SupervisorJob() + ioDispatcher)
    private val syncMutex = Mutex()

    private val _syncState = MutableStateFlow<SyncState>(SyncState.Idle)
    val syncState: Flow<SyncState> = _syncState.asStateFlow()

    fun enqueueFullSync(userId: String) {
        syncScope.launch {
            syncAll(userId)
        }
    }

    suspend fun syncAll(userId: String) = withContext(ioDispatcher) {
        syncMutex.withLock {
            listOf(
                SyncTarget.LIBRARY to { syncLibraryInternal(userId) },
                SyncTarget.READING_PREFERENCES to { syncReadingPreferencesInternal(userId) },
                SyncTarget.READING_PROGRESS to { syncReadingProgressInternal(userId) },
                SyncTarget.BOOKMARKS to { syncBookmarksInternal(userId) },
                SyncTarget.ANNOTATIONS to { syncAnnotationsInternal(userId) }
            ).forEach { (target, block) ->
                runSync(target, block)
            }
        }
    }

    suspend fun syncLibrary(userId: String) = withContext(ioDispatcher) {
        syncMutex.withLock { runSync(SyncTarget.LIBRARY) { syncLibraryInternal(userId) } }
    }

    suspend fun syncReadingPreferences(userId: String) = withContext(ioDispatcher) {
        syncMutex.withLock { runSync(SyncTarget.READING_PREFERENCES) { syncReadingPreferencesInternal(userId) } }
    }

    suspend fun syncReadingProgress(userId: String) = withContext(ioDispatcher) {
        syncMutex.withLock { runSync(SyncTarget.READING_PROGRESS) { syncReadingProgressInternal(userId) } }
    }

    suspend fun syncBookmarks(userId: String) = withContext(ioDispatcher) {
        syncMutex.withLock { runSync(SyncTarget.BOOKMARKS) { syncBookmarksInternal(userId) } }
    }

    suspend fun syncAnnotations(userId: String) = withContext(ioDispatcher) {
        syncMutex.withLock { runSync(SyncTarget.ANNOTATIONS) { syncAnnotationsInternal(userId) } }
    }

    private suspend fun runSync(target: SyncTarget, block: suspend () -> Unit) {
        _syncState.value = SyncState.Running(target)
        try {
            block()
            _syncState.value = SyncState.Idle
        } catch (e: Exception) {
            Log.e(TAG, "Sync failed for $target", e)
            _syncState.value = SyncState.Error(target, e.message ?: "Unknown error")
        }
    }

    private suspend fun syncLibraryInternal(userId: String) {
        val pending = database.libraryDao().getLibraryByStatus(userId)
        pending.forEach { entity ->
            graphQLService.addToLibrary(userId, entity.storyId).fold(
                onSuccess = { remote ->
                    database.libraryDao().insertLibraryItem(remote.toEntity())
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to push library item ${entity.storyId}", error)
                }
            )
        }

        graphQLService.getLibrary(userId).fold(
            onSuccess = { remote ->
                database.libraryDao().insertLibraryItems(remote.map { it.toEntity() })
            },
            onFailure = { error ->
                Log.e(TAG, "Failed to refresh library", error)
            }
        )
    }

    private suspend fun syncReadingPreferencesInternal(userId: String) {
        val local = database.readingPreferencesDao().getPreferences(userId)
        if (local?.syncStatus == SyncStatus.PENDING) {
            graphQLService.updateReadingPreferences(local.toDomain()).fold(
                onSuccess = { remote ->
                    database.readingPreferencesDao().insertPreferences(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to push reading preferences", error)
                }
            )
        } else {
            graphQLService.getReadingPreferences(userId).fold(
                onSuccess = { remote ->
                    remote?.let {
                        database.readingPreferencesDao().insertPreferences(it.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to refresh reading preferences", error)
                }
            )
        }
    }

    private suspend fun syncReadingProgressInternal(userId: String) {
        val pending = database.readingProgressDao().getProgressByStatus(userId)
        pending.forEach { entity ->
            graphQLService.updateReadingProgress(entity.toDomain()).fold(
                onSuccess = { remote ->
                    database.readingProgressDao().insertProgress(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to push reading progress ${entity.storyId}", error)
                }
            )
        }

        pending.map { it.storyId }.distinct().forEach { storyId ->
            graphQLService.getReadingProgress(userId, storyId).fold(
                onSuccess = { remote ->
                    remote?.let {
                        database.readingProgressDao().insertProgress(it.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                    }
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to refresh reading progress for story $storyId", error)
                }
            )
        }
    }

    private suspend fun syncBookmarksInternal(userId: String) {
        val pending = database.bookmarkDao().getBookmarksByStatus(userId)
        pending.forEach { entity ->
            graphQLService.createBookmark(entity.toDomain()).fold(
                onSuccess = { remote ->
                    database.bookmarkDao().insertBookmark(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to push bookmark ${entity.id}", error)
                }
            )
        }

        graphQLService.getBookmarks(userId, null).fold(
            onSuccess = { remote ->
                database.bookmarkDao().insertBookmarks(remote.map { it.copy(syncStatus = SyncStatus.SYNCED).toEntity() })
            },
            onFailure = { error ->
                Log.e(TAG, "Failed to refresh bookmarks", error)
            }
        )
    }

    private suspend fun syncAnnotationsInternal(userId: String) {
        val pending = database.annotationDao().getAnnotationsByStatus(userId)
        pending.forEach { entity ->
            val call = if (entity.lastSyncedAt == null) {
                graphQLService.createAnnotation(entity.toDomain())
            } else {
                graphQLService.updateAnnotation(entity.toDomain())
            }

            call.fold(
                onSuccess = { remote ->
                    database.annotationDao().insertAnnotation(remote.copy(syncStatus = SyncStatus.SYNCED).toEntity())
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to push annotation ${entity.id}", error)
                }
            )
        }

        graphQLService.getAnnotations(userId, null).fold(
            onSuccess = { remote ->
                database.annotationDao().insertAnnotations(remote.map { it.copy(syncStatus = SyncStatus.SYNCED).toEntity() })
            },
            onFailure = { error ->
                Log.e(TAG, "Failed to refresh annotations", error)
            }
        )
    }

    sealed class SyncState {
        object Idle : SyncState()
        data class Running(val target: SyncTarget) : SyncState()
        data class Error(val target: SyncTarget, val message: String) : SyncState()
    }

    enum class SyncTarget {
        LIBRARY,
        READING_PREFERENCES,
        READING_PROGRESS,
        BOOKMARKS,
        ANNOTATIONS
    }

    companion object {
        private const val TAG = "SyncService"
    }
}

// Mapping helpers
private fun Library.toEntity(): LibraryEntity =
    LibraryEntity(
        id = id,
        userId = userId,
        storyId = storyId,
        addedAt = addedAt,
        lastReadAt = lastReadAt,
        isFavorite = isFavorite,
        syncStatus = SyncStatus.SYNCED,
        lastSyncedAt = lastSyncedAt ?: System.currentTimeMillis()
    )

private fun ReadingPreferencesEntity.toDomain(): ReadingPreferences =
    ReadingPreferences(
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

private fun ReadingPreferences.toEntity(): ReadingPreferencesEntity =
    ReadingPreferencesEntity(
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

private fun ReadingProgressEntity.toDomain(): ReadingProgress =
    ReadingProgress(
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

private fun ReadingProgress.toEntity(): ReadingProgressEntity =
    ReadingProgressEntity(
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

private fun BookmarkEntity.toDomain(): Bookmark =
    Bookmark(
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

private fun Bookmark.toEntity(): BookmarkEntity =
    BookmarkEntity(
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

private fun AnnotationEntity.toDomain(): Annotation =
    Annotation(
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

private fun Annotation.toEntity(): AnnotationEntity =
    AnnotationEntity(
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

