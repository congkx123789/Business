package com.storysphere.storyreader.utils.mobile.export

import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import androidx.work.Data
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportSchedule
import com.storysphere.storyreader.model.ExportFrequency
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScheduledExportManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val workManager: WorkManager
) {
    private val preferences: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    private val scheduleFlow: MutableStateFlow<ExportSchedule?> = MutableStateFlow(loadSchedule())

    fun observeSchedule(): StateFlow<ExportSchedule?> = scheduleFlow

    fun currentSchedule(): ExportSchedule? = scheduleFlow.value

    fun scheduleExport(
        userId: String,
        frequency: ExportFrequency,
        includeAnnotations: Boolean,
        includeProgress: Boolean,
        format: ExportFormat,
        startFrom: Long = System.currentTimeMillis()
    ) {
        val nextRun = calculateNextRun(startFrom, frequency)
        val schedule = ExportSchedule(
            userId = userId,
            frequency = frequency,
            includeAnnotations = includeAnnotations,
            includeProgress = includeProgress,
            format = format,
            nextRunAt = nextRun,
            lastRunAt = scheduleFlow.value?.lastRunAt
        )
        persist(schedule)
        enqueueWork(schedule)
    }

    fun cancelSchedule() {
        workManager.cancelUniqueWork(WORK_NAME)
        preferences.edit { remove(KEY_SCHEDULE) }
        scheduleFlow.value = null
    }

    fun handleWorkerCompletion() {
        val existing = scheduleFlow.value ?: return
        val updated = existing.copy(
            lastRunAt = System.currentTimeMillis(),
            nextRunAt = calculateNextRun(existing.nextRunAt, existing.frequency)
        )
        persist(updated)
        enqueueWork(updated)
    }

    private fun enqueueWork(schedule: ExportSchedule) {
        val delayMillis = (schedule.nextRunAt - System.currentTimeMillis()).coerceAtLeast(MIN_DELAY_MS)
        val request = OneTimeWorkRequestBuilder<ScheduledExportWorker>()
            .setInitialDelay(delayMillis, TimeUnit.MILLISECONDS)
            .setInputData(schedule.toWorkerData())
            .addTag(WORK_TAG)
            .build()

        workManager.enqueueUniqueWork(
            WORK_NAME,
            ExistingWorkPolicy.REPLACE,
            request
        )
    }

    private fun persist(schedule: ExportSchedule) {
        val json = gson.toJson(schedule)
        preferences.edit { putString(KEY_SCHEDULE, json) }
        scheduleFlow.value = schedule
    }

    private fun loadSchedule(): ExportSchedule? {
        val json = preferences.getString(KEY_SCHEDULE, null) ?: return null
        return runCatching {
            gson.fromJson<ExportSchedule>(json, object : TypeToken<ExportSchedule>() {}.type)
        }.getOrNull()
    }

    private fun ExportSchedule.toWorkerData(): Data {
        return Data.Builder()
            .putString(KEY_USER_ID, userId)
            .putString(KEY_FREQUENCY, frequency.name)
            .putBoolean(KEY_INCLUDE_ANNOTATIONS, includeAnnotations)
            .putBoolean(KEY_INCLUDE_PROGRESS, includeProgress)
            .putString(KEY_FORMAT, format.name)
            .putLong(KEY_NEXT_RUN_AT, nextRunAt)
            .build()
    }

    private fun calculateNextRun(reference: Long, frequency: ExportFrequency): Long {
        val interval = when (frequency) {
            ExportFrequency.DAILY -> TimeUnit.DAYS.toMillis(1)
            ExportFrequency.WEEKLY -> TimeUnit.DAYS.toMillis(7)
            ExportFrequency.MONTHLY -> TimeUnit.DAYS.toMillis(30)
        }
        return reference + interval
    }

    companion object {
        private const val PREFS_NAME = "scheduled_export_prefs"
        private const val KEY_SCHEDULE = "schedule"
        private const val WORK_NAME = "scheduled-export-work"
        private const val WORK_TAG = "scheduled-export"
        private const val MIN_DELAY_MS = 5_000L

        const val KEY_USER_ID = "user_id"
        const val KEY_FREQUENCY = "frequency"
        const val KEY_INCLUDE_ANNOTATIONS = "include_annotations"
        const val KEY_INCLUDE_PROGRESS = "include_progress"
        const val KEY_FORMAT = "format"
        const val KEY_NEXT_RUN_AT = "next_run_at"
    }
}


