package com.storysphere.storyreader.storage

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ContentStorageService @Inject constructor(
    private val context: Context,
    private val encryptionService: ContentEncryptionService
) {
    private val chaptersDir: File by lazy {
        File(context.filesDir, "chapters").apply {
            if (!exists()) mkdirs()
        }
    }
    
    suspend fun downloadChapter(storyId: String, chapterId: String, content: String): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val storyDir = File(chaptersDir, storyId).apply {
                    if (!exists()) mkdirs()
                }
                
                val file = File(storyDir, "$chapterId.encrypted")
                
                // Encrypt content before writing
                val encryptedContent = encryptionService.encrypt(content)
                
                FileOutputStream(file).use { fos ->
                    fos.write(encryptedContent)
                }
                
                Log.d("ContentStorageService", "Downloaded chapter $chapterId to ${file.absolutePath}")
                Result.success(file.absolutePath)
            } catch (e: Exception) {
                Log.e("ContentStorageService", "Error downloading chapter", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun readChapterContent(filePath: String): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                val file = File(filePath)
                if (!file.exists()) {
                    return@withContext Result.failure(Exception("File not found: $filePath"))
                }
                
                val encryptedContent = file.readBytes()
                val decryptedContent = encryptionService.decrypt(encryptedContent)
                
                Result.success(decryptedContent)
            } catch (e: Exception) {
                Log.e("ContentStorageService", "Error reading chapter content", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun deleteChapter(storyId: String, chapterId: String): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                val file = File(File(chaptersDir, storyId), "$chapterId.encrypted")
                if (file.exists()) {
                    file.delete()
                    Log.d("ContentStorageService", "Deleted chapter $chapterId")
                }
                Result.success(true)
            } catch (e: Exception) {
                Log.e("ContentStorageService", "Error deleting chapter", e)
                Result.failure(e)
            }
        }
    }
    
    suspend fun getStorageUsage(): Long {
        return withContext(Dispatchers.IO) {
            chaptersDir.walkTopDown().sumOf { it.length() }
        }
    }
    
    suspend fun cleanupOldChapters(maxAgeDays: Int = 30): Int {
        return withContext(Dispatchers.IO) {
            val cutoffTime = System.currentTimeMillis() - (maxAgeDays * 24 * 60 * 60 * 1000L)
            var deletedCount = 0
            
            chaptersDir.walkTopDown().forEach { file ->
                if (file.isFile && file.lastModified() < cutoffTime) {
                    file.delete()
                    deletedCount++
                }
            }
            
            deletedCount
        }
    }

    fun buildExportPath(suffix: String): String {
        val exportsDir = File(context.filesDir, "exports").apply {
            if (!exists()) mkdirs()
        }
        return File(exportsDir, "storysphere_export_${System.currentTimeMillis()}.$suffix").absolutePath
    }
}

