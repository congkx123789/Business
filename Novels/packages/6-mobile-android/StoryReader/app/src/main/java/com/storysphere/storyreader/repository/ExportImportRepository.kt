package com.storysphere.storyreader.repository

import com.storysphere.storyreader.model.ExportDestination
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportRecord
import com.storysphere.storyreader.model.ExportScope
import com.storysphere.storyreader.storage.ContentStorageService
import com.storysphere.storyreader.utils.mobile.export.ExportHistoryManager
import kotlinx.coroutines.delay
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExportImportRepository @Inject constructor(
    private val exportHistoryManager: ExportHistoryManager,
    private val contentStorageService: ContentStorageService
) {

    fun observeExportHistory(userId: String) = exportHistoryManager.observeHistory(userId)

    suspend fun exportNow(
        userId: String,
        format: ExportFormat,
        scope: ExportScope,
        destination: ExportDestination
    ): Result<ExportRecord> = runCatching {
        delay(500) // Simulate work while backend integration is wired
        val record = ExportRecord(
            id = UUID.randomUUID().toString(),
            userId = userId,
            format = format,
            scope = scope,
            destination = destination,
            itemCount = estimateItemCount(scope),
            fileSizeBytes = estimateFileSize(scope, format),
            exportedAt = System.currentTimeMillis(),
            filePath = contentStorageService.buildExportPath(format.name.lowercase())
        )
        exportHistoryManager.appendRecord(record)
        record
    }

    suspend fun importData(userId: String, uri: String): Result<Unit> = runCatching {
        delay(500)
        // TODO: Parse selected file and merge into local database
    }

    private fun estimateItemCount(scope: ExportScope): Int {
        return when (scope) {
            ExportScope.LIBRARY -> 200
            ExportScope.ANNOTATIONS -> 75
            ExportScope.READING_PROGRESS -> 120
            ExportScope.ALL -> 350
        }
    }

    private fun estimateFileSize(scope: ExportScope, format: ExportFormat): Long {
        val base = when (scope) {
            ExportScope.LIBRARY -> 350_000L
            ExportScope.ANNOTATIONS -> 180_000L
            ExportScope.READING_PROGRESS -> 120_000L
            ExportScope.ALL -> 512_000L
        }
        val multiplier = when (format) {
            ExportFormat.JSON -> 1.0
            ExportFormat.CSV -> 0.8
            ExportFormat.MARKDOWN -> 1.2
            ExportFormat.PDF -> 1.5
        }
        return (base * multiplier).toLong()
    }
}


