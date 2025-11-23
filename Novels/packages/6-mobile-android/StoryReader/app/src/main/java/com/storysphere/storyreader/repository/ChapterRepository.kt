package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.ChapterMetadataEntity
import com.storysphere.storyreader.model.Chapter
import com.storysphere.storyreader.model.DownloadStatus
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.storage.ContentStorageService
import com.storysphere.storyreader.storage.ChapterDownloadManager
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.launch
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChapterRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val contentStorageService: ContentStorageService,
    private val downloadManager: ChapterDownloadManager
) {
    // Background scope for async operations
    private val backgroundScope = CoroutineScope(SupervisorJob())
    // Loads chapter metadata from Room, content from encrypted file
    fun getChapter(id: String): Flow<Chapter?> = flow {
        val metadata = database.chapterDao().getChapter(id)
        var localContent: String? = null
        metadata?.let { meta ->
            localContent = meta.contentFilePath?.let { filePath ->
                contentStorageService.readChapterContent(filePath).getOrNull()
            }
            emit(meta.toDomain(localContent))
        }

        graphQLService.getChapter(id).fold(
            onSuccess = { remoteChapter ->
                val existing = database.chapterDao().getChapter(remoteChapter.id)
                val merged = remoteChapter.mergeWith(existing)
                database.chapterDao().insertChapter(merged.toEntity())

                remoteChapter.content?.let { chapterContent ->
                    backgroundScope.launch {
                        downloadManager.saveContent(remoteChapter.storyId, remoteChapter.id, chapterContent)
                    }
                }

                emit(remoteChapter)
            },
            onFailure = {
                // keep showing local data; errors handled upstream
            }
        )
    }
    
    fun getChapters(storyId: String): Flow<List<Chapter>> {
        return database.chapterDao().getChaptersByStory(storyId)
            .map { entities ->
                entities.map { meta ->
                    val content = meta.contentFilePath?.let { filePath ->
                        contentStorageService.readChapterContent(filePath).getOrNull()
                    }
                    meta.toDomain(content)
                }
            }
            .onStart {
                backgroundScope.launch {
                    graphQLService.getChapters(storyId).fold(
                        onSuccess = { remoteChapters ->
                            val merged = remoteChapters.map { chapter ->
                                val existing = database.chapterDao().getChapter(chapter.id)
                                chapter.mergeWith(existing).toEntity()
                            }
                            database.chapterDao().insertChapters(merged)
                        },
                        onFailure = {
                            // keep local list if network fails
                        }
                    )
                }
            }
    }
    
    fun queueDownload(storyId: String, chapterId: String) {
        downloadManager.enqueue(storyId, chapterId)
    }

    suspend fun getChaptersForStory(storyId: String): List<Chapter> {
        val entities = database.chapterDao().getChaptersByStoryOnce(storyId)
        return entities.map { entity ->
            val content = entity.contentFilePath?.let { filePath ->
                contentStorageService.readChapterContent(filePath).getOrNull()
            }
            entity.toDomain(content)
        }
    }
}

private fun Chapter.toEntity(): ChapterMetadataEntity {
    return ChapterMetadataEntity(
        id = id,
        storyId = storyId,
        title = title,
        order = order,
        contentFilePath = contentFilePath,
        wordCount = wordCount,
        isPaid = isPaid,
        price = price,
        isUnlocked = isUnlocked,
        isDownloaded = contentFilePath != null,
        downloadStatus = downloadStatus,
        downloadProgress = downloadProgress,
        lastDownloadedAt = lastDownloadedAt,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

private fun ChapterMetadataEntity.toDomain(content: String?): Chapter {
    return Chapter(
        id = id,
        storyId = storyId,
        title = title,
        order = order,
        content = content,
        contentFilePath = contentFilePath,
        wordCount = wordCount,
        isPaid = isPaid,
        price = price,
        isUnlocked = isUnlocked,
        downloadStatus = downloadStatus,
        downloadProgress = downloadProgress,
        lastDownloadedAt = lastDownloadedAt,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

private fun Chapter.mergeWith(existing: ChapterMetadataEntity?): Chapter {
    return if (existing == null) {
        this
    } else {
        this.copy(
            contentFilePath = existing.contentFilePath ?: contentFilePath,
            downloadStatus = existing.downloadStatus,
            downloadProgress = existing.downloadProgress,
            lastDownloadedAt = existing.lastDownloadedAt
        )
    }
}

