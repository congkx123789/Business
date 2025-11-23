package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.repository.StoryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class StorefrontViewModel @Inject constructor(
    private val storyRepository: StoryRepository
) : ViewModel() {
    private val _rankings = MutableStateFlow<List<RankingItem>>(emptyList())
    val rankings: StateFlow<List<RankingItem>> = _rankings.asStateFlow()
    
    private val _editorPicks = MutableStateFlow<List<Story>>(emptyList())
    val editorPicks: StateFlow<List<Story>> = _editorPicks.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadRankings() {
        viewModelScope.launch {
            _isLoading.value = true
            // TODO: Load from repository
            _rankings.value = emptyList()
            _isLoading.value = false
        }
    }
    
    fun loadEditorPicks() {
        viewModelScope.launch {
            _isLoading.value = true
            // TODO: Load from repository
            _editorPicks.value = emptyList()
            _isLoading.value = false
        }
    }
}

