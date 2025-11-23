package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class CommandPaletteViewModel @Inject constructor(
    private val storyRepository: com.storysphere.storyreader.repository.StoryRepository,
    private val searchRepository: com.storysphere.storyreader.repository.SearchRepository
) : ViewModel() {
    
    private val _isOpen = MutableStateFlow(false)
    val isOpen: StateFlow<Boolean> = _isOpen.asStateFlow()
    
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()
    
    private val _searchResults = MutableStateFlow<List<com.storysphere.storyreader.ui.mobile.commandpalette.CommandResult>>(emptyList())
    val searchResults: StateFlow<List<com.storysphere.storyreader.ui.mobile.commandpalette.CommandResult>> = _searchResults.asStateFlow()
    
    fun open() {
        _isOpen.value = true
    }
    
    fun close() {
        _isOpen.value = false
        _searchQuery.value = ""
        _searchResults.value = emptyList()
    }
    
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        if (query.isNotEmpty()) {
            performSearch(query)
        } else {
            _searchResults.value = emptyList()
        }
    }
    
    fun search(userId: String, query: String) {
        _searchQuery.value = query
        performSearch(query)
    }
    
    private fun performSearch(query: String) {
        viewModelScope.launch {
            try {
                val results = mutableListOf<com.storysphere.storyreader.ui.mobile.commandpalette.CommandResult>()
                
                // Search stories
                val stories = searchRepository.searchStories(
                    com.storysphere.storyreader.utils.mobile.search.SearchQuery(text = query)
                )
                stories.take(5).forEach { story ->
                    results.add(
                        com.storysphere.storyreader.ui.mobile.commandpalette.CommandResult(
                            type = com.storysphere.storyreader.ui.mobile.commandpalette.ResultType.STORY,
                            id = story.id,
                            title = story.title,
                            subtitle = story.author
                        )
                    )
                }
                
                // Search chapters, annotations, settings could be added here
                
                _searchResults.value = results
            } catch (e: Exception) {
                // Handle error
                _searchResults.value = emptyList()
            }
        }
    }
    
    fun executeCommand(item: CommandPaletteItem) {
        viewModelScope.launch {
            try {
                // Execute command based on item type
                item.action()
                close()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}

data class CommandPaletteItem(
    val id: String,
    val title: String,
    val subtitle: String? = null,
    val type: CommandType,
    val action: () -> Unit
)

enum class CommandType {
    STORY,
    CHAPTER,
    ANNOTATION,
    SETTING,
    ACTION
}


