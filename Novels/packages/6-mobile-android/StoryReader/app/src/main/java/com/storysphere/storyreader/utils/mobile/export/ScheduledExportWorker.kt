package com.storysphere.storyreader.utils.mobile.export

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.storysphere.storyreader.model.ExportDestination
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportScope
import com.storysphere.storyreader.model.ExportFrequency
import com.storysphere.storyreader.repository.ExportImportRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class ScheduledExportWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val exportImportRepository: ExportImportRepository,
    private val scheduledExportManager: ScheduledExportManager
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val userId = inputData.getString(ScheduledExportManager.KEY_USER_ID) ?: return Result.failure()
        val format = inputData.getString(ScheduledExportManager.KEY_FORMAT)?.runCatching {
            ExportFormat.valueOf(this)
        }?.getOrNull() ?: ExportFormat.JSON
        val frequency = inputData.getString(ScheduledExportManager.KEY_FREQUENCY)?.runCatching {
            ExportFrequency.valueOf(this)
        }?.getOrNull() ?: ExportFrequency.WEEKLY
        val includeAnnotations = inputData.getBoolean(ScheduledExportManager.KEY_INCLUDE_ANNOTATIONS, true)
        val includeProgress = inputData.getBoolean(ScheduledExportManager.KEY_INCLUDE_PROGRESS, true)

        val scope = when {
            includeAnnotations && includeProgress -> ExportScope.ALL
            includeAnnotations -> ExportScope.ANNOTATIONS
            includeProgress -> ExportScope.READING_PROGRESS
            else -> ExportScope.LIBRARY
        }

        val exportResult = exportImportRepository.exportNow(
            userId = userId,
            format = format,
            scope = scope,
            destination = ExportDestination.FILE_SYSTEM
        )

        return if (exportResult.isSuccess) {
            scheduledExportManager.handleWorkerCompletion()
            Result.success()
        } else {
            Result.retry()
        }
    }
}


