package com.storysphere.storyreader.repository

import android.util.Log
import com.storysphere.storyreader.storage.SyncService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Main sync orchestrator - coordinates all sync operations
 * Cross-device sync critical for user experience
 */
@Singleton
class SyncManager @Inject constructor(
    private val syncService: SyncService,
    private val applicationScope: CoroutineScope
) {
    private val _syncStatus = MutableStateFlow<SyncStatus>(SyncStatus.SYNCED)
    val syncStatus: StateFlow<SyncStatus> = _syncStatus.asStateFlow()
    
    fun enqueueFullSync(userId: String) {
        applicationScope.launch {
            _syncStatus.value = SyncStatus.SYNCING
            Log.d("SyncManager", "Starting full sync for user: $userId")
            
            try {
                syncService.enqueueFullSync(userId)
                _syncStatus.value = SyncStatus.SYNCED
                Log.d("SyncManager", "Full sync completed for user: $userId")
            } catch (e: Exception) {
                Log.e("SyncManager", "Full sync failed for user: $userId", e)
                _syncStatus.value = SyncStatus.ERROR
            }
        }
    }
    
    fun syncLibrary(userId: String) {
        applicationScope.launch {
            syncService.syncLibrary(userId)
        }
    }
    
    fun syncReadingProgress(userId: String) {
        applicationScope.launch {
            syncService.syncReadingProgress(userId)
        }
    }
    
    fun syncReadingPreferences(userId: String) {
        applicationScope.launch {
            syncService.syncReadingPreferences(userId)
        }
    }
    
    fun syncBookmarks(userId: String) {
        applicationScope.launch {
            syncService.syncBookmarks(userId)
        }
    }
    
    fun syncAnnotations(userId: String) {
        applicationScope.launch {
            syncService.syncAnnotations(userId)
        }
    }
}

enum class SyncStatus {
    SYNCED,
    SYNCING,
    PENDING,
    CONFLICT,
    ERROR
}
