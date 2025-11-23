package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Bookmark
import com.storysphere.storyreader.repository.BookmarkRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class BookmarkViewModel @Inject constructor(
    private val bookmarkRepository: BookmarkRepository
) : ViewModel() {
    private val _bookmarks = MutableStateFlow<List<Bookmark>>(emptyList())
    val bookmarks: StateFlow<List<Bookmark>> = _bookmarks.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadBookmarks(userId: String, storyId: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                bookmarkRepository.getBookmarks(userId, storyId).collect { bookmarks ->
                    _bookmarks.value = bookmarks
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                _error.value = e.message
                _isLoading.value = false
            }
        }
    }
    
    fun createBookmark(
        userId: String,
        storyId: String,
        chapterId: String,
        position: Int,
        note: String? = null
    ) {
        viewModelScope.launch {
            val bookmark = Bookmark(
                id = UUID.randomUUID().toString(),
                userId = userId,
                storyId = storyId,
                chapterId = chapterId,
                position = position,
                note = note,
                createdAt = System.currentTimeMillis()
            )
            
            bookmarkRepository.createBookmark(bookmark).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
    
    fun deleteBookmark(bookmarkId: String, userId: String) {
        viewModelScope.launch {
            bookmarkRepository.deleteBookmark(bookmarkId, userId).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
}

