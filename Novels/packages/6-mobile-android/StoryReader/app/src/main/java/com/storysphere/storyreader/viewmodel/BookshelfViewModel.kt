package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Bookshelf
import com.storysphere.storyreader.repository.BookshelfRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class BookshelfViewModel @Inject constructor(
    private val bookshelfRepository: BookshelfRepository
) : ViewModel() {
    private val _bookshelves = MutableStateFlow<List<Bookshelf>>(emptyList())
    val bookshelves: StateFlow<List<Bookshelf>> = _bookshelves.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadBookshelves(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                bookshelfRepository.getBookshelves(userId).collect { bookshelves ->
                    _bookshelves.value = bookshelves
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                _error.value = e.message
                _isLoading.value = false
            }
        }
    }
    
    fun createBookshelf(
        userId: String,
        name: String,
        description: String? = null,
        color: String? = null
    ) {
        viewModelScope.launch {
            val bookshelf = Bookshelf(
                id = UUID.randomUUID().toString(),
                userId = userId,
                name = name,
                description = description,
                color = color,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            
            bookshelfRepository.createBookshelf(bookshelf).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
    
    fun deleteBookshelf(bookshelfId: String) {
        viewModelScope.launch {
            bookshelfRepository.deleteBookshelf(bookshelfId).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
    
    fun addStoryToBookshelf(bookshelfId: String, storyId: String) {
        viewModelScope.launch {
            bookshelfRepository.addStoryToBookshelf(bookshelfId, storyId)
        }
    }
    
    fun removeStoryFromBookshelf(bookshelfId: String, storyId: String) {
        viewModelScope.launch {
            bookshelfRepository.removeStoryFromBookshelf(bookshelfId, storyId)
        }
    }
}

