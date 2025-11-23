package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Chapter
import com.storysphere.storyreader.model.DownloadStatus
import com.storysphere.storyreader.repository.ChapterRepository
import com.storysphere.storyreader.storage.ChapterDownloadManager
import com.storysphere.storyreader.storage.ContentStorageService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DownloadManagerViewModel @Inject constructor(
    private val chapterRepository: ChapterRepository,
    private val chapterDownloadManager: ChapterDownloadManager,
    private val contentStorageService: ContentStorageService
) : ViewModel() {
    
    private val _downloadQueue = MutableStateFlow<List<Chapter>>(emptyList())
    val downloadQueue: StateFlow<List<Chapter>> = _downloadQueue.asStateFlow()
    
    private val _downloadStatus = MutableStateFlow<Map<String, DownloadStatus>>(emptyMap())
    val downloadStatus: StateFlow<Map<String, DownloadStatus>> = _downloadStatus.asStateFlow()
    
    private val _storageUsage = MutableStateFlow<Pair<Long, Long>>(0L to 0L) // Used, Total
    val storageUsage: StateFlow<Pair<Long, Long>> = _storageUsage.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    init {
        viewModelScope.launch {
            chapterDownloadManager.downloadStatus.collect { statusMap ->
                _downloadStatus.value = statusMap
            }
        }
    }
    
    fun loadDownloadQueue(storyId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                chapterRepository.getChapters(storyId).collect { chapters ->
                    val queued = chapters.filter { 
                        it.downloadStatus == DownloadStatus.PENDING || 
                        it.downloadStatus == DownloadStatus.DOWNLOADING 
                    }
                    _downloadQueue.value = queued
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun queueDownload(storyId: String, chapterId: String) {
        viewModelScope.launch {
            try {
                chapterRepository.queueDownload(storyId, chapterId, null)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun cancelDownload(chapterId: String) {
        viewModelScope.launch {
            try {
                // TODO: Implement cancel download in ChapterDownloadManager
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun loadStorageUsage() {
        viewModelScope.launch {
            try {
                val usage = contentStorageService.getStorageUsage()
                _storageUsage.value = usage
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun cleanupOldChapters(daysToKeep: Int = 30) {
        viewModelScope.launch {
            try {
                contentStorageService.cleanupOldChapters(daysToKeep)
                loadStorageUsage()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}

