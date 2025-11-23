package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.ExportDestination
import com.storysphere.storyreader.model.ExportFormat
import com.storysphere.storyreader.model.ExportFrequency
import com.storysphere.storyreader.model.ExportRecord
import com.storysphere.storyreader.model.ExportSchedule
import com.storysphere.storyreader.model.ExportScope
import com.storysphere.storyreader.repository.ExportImportRepository
import com.storysphere.storyreader.utils.mobile.export.ScheduledExportManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ExportImportViewModel @Inject constructor(
    private val exportImportRepository: ExportImportRepository,
    private val scheduledExportManager: ScheduledExportManager
) : ViewModel() {

    private val _exportProgress = MutableStateFlow(0f)
    val exportProgress: StateFlow<Float> = _exportProgress.asStateFlow()

    private val _isExporting = MutableStateFlow(false)
    val isExporting: StateFlow<Boolean> = _isExporting.asStateFlow()

    private val _isImporting = MutableStateFlow(false)
    val isImporting: StateFlow<Boolean> = _isImporting.asStateFlow()

    private val _exportHistory = MutableStateFlow<List<ExportRecord>>(emptyList())
    val exportHistory: StateFlow<List<ExportRecord>> = _exportHistory.asStateFlow()

    private val _messages = MutableSharedFlow<String>()
    val messages: MutableSharedFlow<String> = _messages

    val scheduleState: StateFlow<ExportSchedule?> =
        scheduledExportManager.observeSchedule().stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.Eagerly, scheduledExportManager.currentSchedule())

    private var historyJob: Job? = null

    fun observeHistory(userId: String) {
        if (historyJob?.isActive == true) {
            historyJob?.cancel()
        }
        historyJob = viewModelScope.launch {
            exportImportRepository.observeExportHistory(userId).collectLatest { history ->
                _exportHistory.value = history
            }
        }
    }

    fun exportNow(
        userId: String,
        format: ExportFormat,
        scope: ExportScope,
        destination: ExportDestination
    ) {
        viewModelScope.launch {
            _isExporting.value = true
            _exportProgress.value = 0f
            val result = exportImportRepository.exportNow(userId, format, scope, destination)
            _isExporting.value = false
            _exportProgress.value = if (result.isSuccess) 1f else 0f
            result.fold(
                onSuccess = {
                    _messages.emit("Export completed and saved to ${it.filePath ?: "device storage"}.")
                },
                onFailure = { error ->
                    _messages.emit(error.localizedMessage ?: "Export failed")
                }
            )
        }
    }

    fun importData(userId: String, uri: String) {
        viewModelScope.launch {
            _isImporting.value = true
            val result = exportImportRepository.importData(userId, uri)
            _isImporting.value = false
            result.fold(
                onSuccess = { _messages.emit("Import completed successfully.") },
                onFailure = { _messages.emit(it.localizedMessage ?: "Import failed") }
            )
        }
    }

    fun scheduleExport(
        userId: String,
        frequency: ExportFrequency,
        includeAnnotations: Boolean,
        includeProgress: Boolean,
        format: ExportFormat
    ) {
        scheduledExportManager.scheduleExport(
            userId = userId,
            frequency = frequency,
            includeAnnotations = includeAnnotations,
            includeProgress = includeProgress,
            format = format
        )
        viewModelScope.launch {
            _messages.emit("Scheduled ${frequency.name.lowercase().replaceFirstChar { it.uppercase() }} export.")
        }
    }

    fun cancelSchedule() {
        scheduledExportManager.cancelSchedule()
        viewModelScope.launch {
            _messages.emit("Scheduled exports cancelled.")
        }
    }
}

