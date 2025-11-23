package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.repository.SearchRepository
import com.storysphere.storyreader.utils.mobile.search.FilterPresetsManager
import com.storysphere.storyreader.utils.mobile.search.SearchHistoryManager
import com.storysphere.storyreader.utils.mobile.search.SearchQuery
import com.storysphere.storyreader.utils.mobile.search.SearchSuggestionsManager
import com.storysphere.storyreader.utils.mobile.search.SuggestionType
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AdvancedSearchViewModel @Inject constructor(
    private val searchRepository: SearchRepository,
    private val searchHistoryManager: SearchHistoryManager,
    private val searchSuggestionsManager: SearchSuggestionsManager,
    private val filterPresetsManager: FilterPresetsManager
) : ViewModel() {
    
    private val _searchResults = MutableStateFlow<List<Story>>(emptyList())
    val searchResults: StateFlow<List<Story>> = _searchResults.asStateFlow()
    
    private val _searchHistory = MutableStateFlow<List<com.storysphere.storyreader.utils.mobile.search.SearchQuery>>(emptyList())
    val searchHistory: StateFlow<List<com.storysphere.storyreader.utils.mobile.search.SearchQuery>> = _searchHistory.asStateFlow()
    
    private val _suggestions = MutableStateFlow<List<com.storysphere.storyreader.utils.mobile.search.SearchSuggestion>>(emptyList())
    val suggestions: StateFlow<List<com.storysphere.storyreader.utils.mobile.search.SearchSuggestion>> = _suggestions.asStateFlow()
    
    private val _filterPresets = MutableStateFlow<List<com.storysphere.storyreader.utils.mobile.search.FilterPreset>>(emptyList())
    val filterPresets: StateFlow<List<com.storysphere.storyreader.utils.mobile.search.FilterPreset>> = _filterPresets.asStateFlow()
    
    private val _isSearching = MutableStateFlow(false)
    val isSearching: StateFlow<Boolean> = _isSearching.asStateFlow()
    
    private var currentUserId: String = ""
    private var currentQuery: String = ""
    
    fun observeHistory(userId: String) {
        currentUserId = userId
        viewModelScope.launch {
            searchHistoryManager.observeHistory(userId).collectLatest { history ->
                _searchHistory.value = history
            }
        }
    }
    
    fun observePresets(userId: String) {
        currentUserId = userId
        viewModelScope.launch {
            filterPresetsManager.observePresets(userId).collectLatest { presets ->
                _filterPresets.value = presets
            }
        }
    }
    
    fun updateQuery(query: String) {
        currentQuery = query
        viewModelScope.launch {
            if (currentUserId.isNotEmpty()) {
                searchSuggestionsManager.getSuggestions(currentUserId, query).collectLatest { suggestions ->
                    _suggestions.value = suggestions
                }
            }
        }
    }
    
    fun search(userId: String, query: String) {
        currentUserId = userId
        currentQuery = query
        viewModelScope.launch {
            _isSearching.value = true
            try {
                val searchQuery = SearchQuery(text = query)
                val results = searchRepository.searchStories(searchQuery)
                _searchResults.value = results
                
                // Add to search history
                searchHistoryManager.addQuery(userId, query, com.storysphere.storyreader.utils.mobile.search.QueryType.STORY)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isSearching.value = false
            }
        }
    }
    
    fun removeFromHistory(queryId: String) {
        viewModelScope.launch {
            searchHistoryManager.removeQuery(queryId)
        }
    }
    
    fun clearHistory(userId: String) {
        viewModelScope.launch {
            searchHistoryManager.clearHistory(userId)
        }
    }
    
    fun deletePreset(presetId: String) {
        viewModelScope.launch {
            filterPresetsManager.deletePreset(presetId)
        }
    }
}

data class SearchFilters(
    val genres: List<String>? = null,
    val authors: List<String>? = null,
    val status: com.storysphere.storyreader.model.StoryStatus? = null,
    val dateRange: DateRange? = null
)

data class DateRange(
    val startDate: Long? = null,
    val endDate: Long? = null
)


