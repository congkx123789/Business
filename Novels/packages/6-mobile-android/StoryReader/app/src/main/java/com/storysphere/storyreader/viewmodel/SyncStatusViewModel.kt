package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.storage.SyncService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SyncStatusViewModel @Inject constructor(
    private val syncService: SyncService
) : ViewModel() {
    
    private val _syncStatus = MutableStateFlow<SyncStatus>(SyncStatus.SYNCED)
    val syncStatus: StateFlow<SyncStatus> = _syncStatus.asStateFlow()
    
    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime.asStateFlow()
    
    private val _syncProgress = MutableStateFlow<Float>(0f)
    val syncProgress: StateFlow<Float> = _syncProgress.asStateFlow()
    
    private val _syncError = MutableStateFlow<String?>(null)
    val syncError: StateFlow<String?> = _syncError.asStateFlow()
    
    init {
        viewModelScope.launch {
            syncService.syncStatus.collect { status ->
                _syncStatus.value = status
            }
        }
    }
    
    fun triggerSync(userId: String) {
        viewModelScope.launch {
            _syncStatus.value = SyncStatus.SYNCING
            _syncError.value = null
            try {
                syncService.enqueueFullSync(userId)
                _lastSyncTime.value = System.currentTimeMillis()
            } catch (e: Exception) {
                _syncError.value = e.message
                _syncStatus.value = SyncStatus.ERROR
            }
        }
    }
    
    fun clearError() {
        _syncError.value = null
    }
}

