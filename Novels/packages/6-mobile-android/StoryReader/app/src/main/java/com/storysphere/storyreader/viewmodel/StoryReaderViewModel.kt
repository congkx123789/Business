package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.BackgroundMode
import com.storysphere.storyreader.model.Chapter
import com.storysphere.storyreader.model.ReadingMode
import com.storysphere.storyreader.model.ReadingPreferences
import com.storysphere.storyreader.model.SyncStatus
import com.storysphere.storyreader.repository.ChapterRepository
import com.storysphere.storyreader.repository.ReadingPreferencesRepository
import com.storysphere.storyreader.repository.ReadingProgressRepository
import com.storysphere.storyreader.storage.SyncService
import com.storysphere.storyreader.tts.TextToSpeechManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StoryReaderViewModel @Inject constructor(
    private val chapterRepository: ChapterRepository,
    private val readingPreferencesRepository: ReadingPreferencesRepository,
    private val readingProgressRepository: ReadingProgressRepository,
    private val bookmarkRepository: com.storysphere.storyreader.repository.BookmarkRepository,
    private val annotationRepository: com.storysphere.storyreader.repository.AnnotationRepository,
    private val ttsManager: TextToSpeechManager,
    private val syncService: SyncService
) : ViewModel() {
    private val _chapter = MutableStateFlow<Chapter?>(null)
    val chapter: StateFlow<Chapter?> = _chapter.asStateFlow()
    
    private val _readingPreferences = MutableStateFlow<ReadingPreferences?>(null)
    val readingPreferences: StateFlow<ReadingPreferences?> = _readingPreferences.asStateFlow()

    private val _chapterList = MutableStateFlow<List<Chapter>>(emptyList())
    val chapterList: StateFlow<List<Chapter>> = _chapterList.asStateFlow()
    
    private val _showControls = MutableStateFlow(false)
    val showControls: StateFlow<Boolean> = _showControls.asStateFlow()

    private val _userBrightness = MutableStateFlow(1f)
    val userBrightness: StateFlow<Float> = _userBrightness.asStateFlow()

    private var autoHideJob: Job? = null
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private var retryCount = 0
    private val maxRetries = 3
    private val retryDelayMs = 1000L

    private val _bookmarks = MutableStateFlow<List<com.storysphere.storyreader.model.Bookmark>>(emptyList())
    val bookmarks: StateFlow<List<com.storysphere.storyreader.model.Bookmark>> = _bookmarks.asStateFlow()

    private val _annotations = MutableStateFlow<List<com.storysphere.storyreader.model.Annotation>>(emptyList())
    val annotations: StateFlow<List<com.storysphere.storyreader.model.Annotation>> = _annotations.asStateFlow()
    
    private var userId: String = "" // Will be set when loading chapter

    private val _showBookmarkDialog = MutableStateFlow(false)
    val showBookmarkDialog: StateFlow<Boolean> = _showBookmarkDialog.asStateFlow()

    private val _annotationDialogState = MutableStateFlow<Pair<Boolean, String?>>(false to null)
    val annotationDialogState: StateFlow<Pair<Boolean, String?>> = _annotationDialogState.asStateFlow()
    
    fun loadChapter(chapterId: String, userIdParam: String = userId, retry: Boolean = false) {
        if (userIdParam.isNotEmpty()) {
            userId = userIdParam
        }
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            chapterRepository.getChapter(chapterId)
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
                        loadChapter(chapterId, userId, retry = true)
                    } else {
                        _error.value = e.message ?: "Failed to load chapter after $maxRetries retries"
                        _isLoading.value = false
                        retryCount = 0
                    }
                }
                .collect { chapter ->
                    _chapter.value = chapter
                    _isLoading.value = false
                    retryCount = 0
                    chapter?.storyId?.let { storyId ->
                        if (_chapterList.value.isEmpty()) {
                            loadChapterList(storyId)
                        }
                    }
                }
        }
        if (userId.isNotEmpty()) {
            viewModelScope.launch {
                bookmarkRepository.getBookmarks(userId, null)
                    .catch { e -> _error.value = "Failed to load bookmarks: ${e.message}" }
                    .collect { _bookmarks.value = it }
            }
            viewModelScope.launch {
                annotationRepository.getAnnotations(userId, chapterId)
                    .catch { e -> _error.value = "Failed to load annotations: ${e.message}" }
                    .collect { _annotations.value = it }
            }
        }
    }
    
    fun retryLoadChapter() {
        _chapter.value?.id?.let { chapterId ->
            loadChapter(chapterId, userId, retry = true)
        }
    }
    
    fun clearError() {
        _error.value = null
    }
    
    fun loadReadingPreferences(userId: String) {
        viewModelScope.launch {
            readingPreferencesRepository.getPreferences(userId)
                .catch { e -> _error.value = e.message }
                .collect { preferences ->
                    _readingPreferences.value = preferences
                    preferences?.let {
                        _userBrightness.value = it.brightness / 100f
                    }
                }
        }
    }
    
    fun toggleControls(preferences: ReadingPreferences?) {
        if (preferences?.tapToToggleControls == false) return
        _showControls.value = !_showControls.value
        if (_showControls.value && preferences?.autoHideControls == true) {
            scheduleAutoHide(preferences.controlsTimeout)
        } else {
            autoHideJob?.cancel()
        }
    }

    fun openBookmarkDialog() {
        _showBookmarkDialog.value = true
    }

    fun closeBookmarkDialog() {
        _showBookmarkDialog.value = false
    }

    fun openAnnotationDialog(selectedText: String) {
        _annotationDialogState.value = true to selectedText
    }

    fun closeAnnotationDialog() {
        _annotationDialogState.value = false to null
    }

    fun createBookmark(userId: String, note: String?) {
        val current = _chapter.value ?: return
        viewModelScope.launch {
            val bookmark = com.storysphere.storyreader.model.Bookmark(
                id = "${userId}_${current.id}_${System.currentTimeMillis()}",
                userId = userId,
                storyId = current.storyId,
                chapterId = current.id,
                position = 0,
                note = note,
                createdAt = System.currentTimeMillis(),
                syncStatus = SyncStatus.PENDING,
                lastSyncedAt = null
            )
            // Optimistic update
            val currentBookmarks = _bookmarks.value.toMutableList()
            currentBookmarks.add(bookmark)
            _bookmarks.value = currentBookmarks
            
            bookmarkRepository.createBookmark(bookmark).fold(
                onSuccess = {
                    // Already updated via Flow
                },
                onFailure = { error ->
                    // Rollback optimistic update
                    _bookmarks.value = currentBookmarks.filter { it.id != bookmark.id }
                    _error.value = error.message ?: "Failed to create bookmark"
                }
            )
            syncService.syncBookmarks(userId)
        }
    }

    fun deleteBookmark(bookmarkId: String, userId: String) {
        viewModelScope.launch {
            // Optimistic update - save current state for rollback
            val currentBookmarks = _bookmarks.value.toMutableList()
            val bookmarkToRemove = currentBookmarks.find { it.id == bookmarkId }
            
            if (bookmarkToRemove != null) {
                _bookmarks.value = currentBookmarks.filter { it.id != bookmarkId }
                
                bookmarkRepository.deleteBookmark(bookmarkId, userId).fold(
                    onSuccess = {
                        // Already updated via Flow
                    },
                    onFailure = { error ->
                        // Rollback optimistic update
                        _bookmarks.value = currentBookmarks
                        _error.value = error.message ?: "Failed to delete bookmark"
                    }
                )
                syncService.syncBookmarks(userId)
            }
        }
    }

    fun createAnnotation(userId: String, selectedText: String, note: String?, color: String?) {
        val current = _chapter.value ?: return
        val start = current.content?.indexOf(selectedText)?.takeIf { it >= 0 } ?: 0
        val end = (start + selectedText.length).coerceAtMost(current.content?.length ?: 0)

        viewModelScope.launch {
            val annotation = com.storysphere.storyreader.model.Annotation(
                id = "${userId}_${current.id}_${System.currentTimeMillis()}",
                userId = userId,
                storyId = current.storyId,
                chapterId = current.id,
                startPosition = start,
                endPosition = end,
                selectedText = selectedText,
                note = note,
                color = color,
                tags = emptyList(),
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis(),
                syncStatus = SyncStatus.PENDING,
                lastSyncedAt = null
            )
            // Optimistic update
            val currentAnnotations = _annotations.value.toMutableList()
            currentAnnotations.add(annotation)
            _annotations.value = currentAnnotations
            
            annotationRepository.createAnnotation(annotation).fold(
                onSuccess = {
                    // Already updated via Flow
                },
                onFailure = { error ->
                    // Rollback optimistic update
                    _annotations.value = currentAnnotations.filter { it.id != annotation.id }
                    _error.value = error.message ?: "Failed to create annotation"
                }
            )
            syncService.syncAnnotations(userId)
        }
    }

    private fun scheduleAutoHide(timeoutMs: Long) {
        autoHideJob?.cancel()
        autoHideJob = viewModelScope.launch {
            delay(timeoutMs)
            _showControls.value = false
        }
    }

    fun updateFontSize(fontSize: Int) = updatePreferences { it.copy(fontSize = fontSize.coerceIn(12, 24)) }
    fun updateLineHeight(lineHeight: Float) = updatePreferences { it.copy(lineHeight = lineHeight.coerceIn(1.2f, 2f)) }
    fun updateReadingMode(mode: ReadingMode) = updatePreferences { it.copy(readingMode = mode) }
    fun updateBackgroundMode(mode: BackgroundMode, customColor: String? = null) =
        updatePreferences { it.copy(backgroundColor = mode, customBackgroundColor = customColor) }
    fun updateBrightness(brightness: Int) = updatePreferences {
        _userBrightness.value = brightness / 100f
        it.copy(brightness = brightness.coerceIn(0, 100))
    }
    fun updateTapToToggle(enabled: Boolean) = updatePreferences { it.copy(tapToToggleControls = enabled) }
    fun updateAutoHideControls(enabled: Boolean) = updatePreferences { it.copy(autoHideControls = enabled) }
    fun updateControlsTimeout(timeoutMs: Long) = updatePreferences { it.copy(controlsTimeout = timeoutMs) }

    private fun updatePreferences(transform: (ReadingPreferences) -> ReadingPreferences) {
        val current = _readingPreferences.value ?: return
        val updated = transform(current).copy(syncStatus = SyncStatus.PENDING, lastSyncedAt = null)
        _readingPreferences.value = updated

        viewModelScope.launch {
            readingPreferencesRepository.updatePreferences(updated).onFailure { error ->
                _error.value = error.message
            }
            syncService.syncReadingPreferences(updated.userId)
        }
    }
    
    // TTS Controls
    fun startTTS() {
        viewModelScope.launch {
            val content = _chapter.value?.content
            if (content != null) {
                ttsManager.speak(content) {
                    // TTS completed
                }
            }
        }
    }
    
    fun stopTTS() {
        viewModelScope.launch {
            ttsManager.stop()
        }
    }
    
    fun pauseTTS() {
        viewModelScope.launch {
            ttsManager.pause()
        }
    }
    
    fun resumeTTS() {
        viewModelScope.launch {
            ttsManager.resume()
        }
    }
    
    fun setTTSSpeed(rate: Float) {
        ttsManager.setSpeechRate(rate)
    }
    
    fun isTTSPlaying(): Boolean {
        return ttsManager.isSpeaking()
    }
    
    // Reading Progress Tracking (with debouncing to avoid excessive updates)
    private var lastProgressUpdate = 0L
    private val PROGRESS_UPDATE_INTERVAL = 2000L // Update every 2 seconds
    
    fun updateReadingProgress(
        userId: String,
        storyId: String,
        chapterId: String,
        position: Int,
        progress: Float
    ) {
        val now = System.currentTimeMillis()
        // Debounce: Only update if enough time has passed
        if (now - lastProgressUpdate < PROGRESS_UPDATE_INTERVAL) {
            return
        }
        lastProgressUpdate = now
        
        viewModelScope.launch {
            val readingProgress = com.storysphere.storyreader.model.ReadingProgress(
                id = "${userId}_${storyId}_${chapterId}",
                userId = userId,
                storyId = storyId,
                chapterId = chapterId,
                position = position,
                progress = progress,
                wordsPerMinute = null,
                readingTime = null,
                lastReadAt = System.currentTimeMillis(),
                syncStatus = com.storysphere.storyreader.model.SyncStatus.PENDING,
                lastSyncedAt = null
            )
            
            readingProgressRepository.updateProgress(readingProgress).fold(
                onSuccess = { /* Updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }

    private fun loadChapterList(storyId: String) {
        viewModelScope.launch {
            val chapters = chapterRepository.getChaptersForStory(storyId)
            _chapterList.value = chapters
        }
    }

    fun goToPreviousChapter(userId: String) {
        val current = _chapter.value ?: return
        val index = _chapterList.value.indexOfFirst { it.id == current.id }
        val previous = _chapterList.value.getOrNull(index - 1)
        if (previous != null) {
            loadChapter(previous.id)
            syncService.enqueueFullSync(userId)
        }
    }

    fun goToNextChapter(userId: String) {
        val current = _chapter.value ?: return
        val index = _chapterList.value.indexOfFirst { it.id == current.id }
        val next = _chapterList.value.getOrNull(index + 1)
        if (next != null) {
            loadChapter(next.id)
            syncService.enqueueFullSync(userId)
        }
    }

    fun chapterProgress(): Float {
        val current = _chapter.value ?: return 0f
        val index = _chapterList.value.indexOfFirst { it.id == current.id }
        if (index < 0 || _chapterList.value.isEmpty()) return 0f
        return index.toFloat() / _chapterList.value.size.toFloat()
    }
    
    override fun onCleared() {
        super.onCleared()
        ttsManager.shutdown()
    }
}

