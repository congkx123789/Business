package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.repository.LibraryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import javax.inject.Inject

@HiltViewModel
class LibraryViewModel @Inject constructor(
    private val libraryRepository: LibraryRepository
) : ViewModel() {
    private val _libraryItems = MutableStateFlow<List<Library>>(emptyList())
    val libraryItems: StateFlow<List<Library>> = _libraryItems.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private var retryCount = 0
    private val maxRetries = 3
    private val retryDelayMs = 1000L
    
    fun loadLibrary(userId: String, retry: Boolean = false) {
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            libraryRepository.getLibrary(userId)
                .onStart { 
                    _isLoading.value = true
                    if (!retry) {
                        _error.value = null
                    }
                }
                .catch { e ->
                    if (retryCount < maxRetries) {
                        retryCount++
                        delay(retryDelayMs * retryCount) // Exponential backoff
                        loadLibrary(userId, retry = true)
                    } else {
                        _error.value = e.message ?: "Failed to load library after $maxRetries retries"
                        _isLoading.value = false
                        retryCount = 0
                    }
                }
                .collect { items ->
                    _libraryItems.value = items
                    _isLoading.value = false
                    retryCount = 0
                }
        }
    }
    
    fun retry() {
        // Get userId from current library items or use default
        val userId = _libraryItems.value.firstOrNull()?.userId ?: "user1"
        loadLibrary(userId, retry = true)
    }
    
    fun addToLibrary(userId: String, storyId: String) {
        viewModelScope.launch {
            // Optimistic update
            val optimisticItem = Library(
                id = "temp-${System.currentTimeMillis()}",
                userId = userId,
                storyId = storyId,
                addedAt = System.currentTimeMillis(),
                lastReadAt = null,
                isFavorite = false,
                syncStatus = com.storysphere.storyreader.model.SyncStatus.PENDING,
                lastSyncedAt = null
            )
            val currentItems = _libraryItems.value.toMutableList()
            currentItems.add(optimisticItem)
            _libraryItems.value = currentItems
            
            libraryRepository.addToLibrary(userId, storyId).fold(
                onSuccess = { 
                    // Already updated via Flow, remove optimistic item
                    _libraryItems.value = _libraryItems.value.filter { it.id != optimisticItem.id }
                },
                onFailure = { error ->
                    // Rollback optimistic update
                    _libraryItems.value = currentItems.filter { it.id != optimisticItem.id }
                    _error.value = error.message ?: "Failed to add to library"
                }
            )
        }
    }
    
    fun removeFromLibrary(userId: String, storyId: String) {
        viewModelScope.launch {
            // Optimistic update - save current state for rollback
            val currentItems = _libraryItems.value.toMutableList()
            val itemToRemove = currentItems.find { it.storyId == storyId }
            
            if (itemToRemove != null) {
                _libraryItems.value = currentItems.filter { it.storyId != storyId }
                
                libraryRepository.removeFromLibrary(userId, storyId).fold(
                    onSuccess = { 
                        // Already updated via Flow
                    },
                    onFailure = { error ->
                        // Rollback optimistic update
                        _libraryItems.value = currentItems
                        _error.value = error.message ?: "Failed to remove from library"
                    }
                )
            }
        }
    }
    
    fun clearError() {
        _error.value = null
    }
}

