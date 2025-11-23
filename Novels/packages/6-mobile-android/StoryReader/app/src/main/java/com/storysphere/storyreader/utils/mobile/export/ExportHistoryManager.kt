package com.storysphere.storyreader.utils.mobile.export

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.ExportRecordEntity
import com.storysphere.storyreader.model.ExportDestination
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportRecord
import com.storysphere.storyreader.model.ExportScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExportHistoryManager @Inject constructor(
    private val database: AppDatabase
) {
    fun observeHistory(userId: String): Flow<List<ExportRecord>> {
        return database.exportRecordDao().observeHistory(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }

    suspend fun appendRecord(record: ExportRecord, historyLimit: Int = DEFAULT_HISTORY_LIMIT) {
        withContext(Dispatchers.IO) {
            database.exportRecordDao().insert(record.toEntity())
            database.exportRecordDao().trimHistory(record.userId, historyLimit)
        }
    }

    companion object {
        private const val DEFAULT_HISTORY_LIMIT = 50
    }
}

private fun ExportRecordEntity.toModel(): ExportRecord {
    return ExportRecord(
        id = id,
        userId = userId,
        format = runCatching { ExportFormat.valueOf(format) }.getOrElse { ExportFormat.JSON },
        scope = runCatching { ExportScope.valueOf(scope) }.getOrElse { ExportScope.LIBRARY },
        destination = runCatching { ExportDestination.valueOf(destination) }.getOrElse { ExportDestination.FILE_SYSTEM },
        itemCount = itemCount,
        fileSizeBytes = fileSizeBytes,
        exportedAt = exportedAt,
        filePath = filePath
    )
}

private fun ExportRecord.toEntity(): ExportRecordEntity {
    return ExportRecordEntity(
        id = id,
        userId = userId,
        format = format.name,
        scope = scope.name,
        destination = destination.name,
        itemCount = itemCount,
        fileSizeBytes = fileSizeBytes,
        exportedAt = exportedAt,
        filePath = filePath
    )
}


