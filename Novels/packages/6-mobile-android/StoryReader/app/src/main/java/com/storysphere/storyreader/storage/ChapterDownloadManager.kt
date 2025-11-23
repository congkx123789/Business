package com.storysphere.storyreader.storage

import android.util.Log
import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.DownloadStatus
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ChapterDownloadManager @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService,
    private val contentStorageService: ContentStorageService
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val activeDownloads = mutableSetOf<String>()
    private val activeMutex = Mutex()

    fun enqueue(storyId: String, chapterId: String) {
        scope.launch {
            val key = chapterId
            if (!registerDownload(key)) return@launch

            try {
                database.chapterDao().updateDownloadProgress(
                    id = chapterId,
                    status = DownloadStatus.QUEUED,
                    progress = 0
                )
                val chapterResult = graphQLService.getChapter(chapterId)
                chapterResult.fold(
                    onSuccess = { chapter ->
                        val content = chapter.content
                            ?: throw IllegalStateException("Chapter $chapterId has no content to download")
                        saveContentInternal(storyId, chapterId, content)
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Failed to fetch chapter $chapterId for download", error)
                        database.chapterDao().updateDownloadProgress(
                            id = chapterId,
                            status = DownloadStatus.FAILED,
                            progress = 0
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Download failed for chapter $chapterId", e)
                database.chapterDao().updateDownloadProgress(
                    id = chapterId,
                    status = DownloadStatus.FAILED,
                    progress = 0
                )
            } finally {
                unregisterDownload(key)
            }
        }
    }

    suspend fun saveContent(storyId: String, chapterId: String, content: String) {
        withContext(Dispatchers.IO) {
            saveContentInternal(storyId, chapterId, content)
        }
    }

    private suspend fun saveContentInternal(storyId: String, chapterId: String, content: String) {
        database.chapterDao().updateDownloadProgress(
            id = chapterId,
            status = DownloadStatus.DOWNLOADING,
            progress = 10
        )

        contentStorageService.downloadChapter(storyId, chapterId, content).fold(
            onSuccess = { filePath ->
                database.chapterDao().updateDownloadStatus(
                    id = chapterId,
                    isDownloaded = true,
                    filePath = filePath,
                    status = DownloadStatus.DOWNLOADED,
                    progress = 100,
                    lastDownloadedAt = System.currentTimeMillis()
                )
            },
            onFailure = { error ->
                Log.e(TAG, "Failed to store chapter $chapterId content", error)
                database.chapterDao().updateDownloadProgress(
                    id = chapterId,
                    status = DownloadStatus.FAILED,
                    progress = 0
                )
            }
        )
    }

    private suspend fun registerDownload(key: String): Boolean {
        return activeMutex.withLock {
            if (activeDownloads.contains(key)) {
                false
            } else {
                activeDownloads.add(key)
                true
            }
        }
    }

    private suspend fun unregisterDownload(key: String) {
        activeMutex.withLock {
            activeDownloads.remove(key)
        }
    }

    companion object {
        private const val TAG = "ChapterDownloadManager"
    }
}


