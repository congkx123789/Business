package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.model.SystemList
import com.storysphere.storyreader.repository.LibraryRepository
import com.storysphere.storyreader.repository.StoryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LibraryAutoOrganizationViewModel @Inject constructor(
    private val libraryRepository: LibraryRepository,
    private val storyRepository: StoryRepository
) : ViewModel() {
    
    private val _authorGroups = MutableStateFlow<Map<String, List<Library>>>(emptyMap())
    val authorGroups: StateFlow<Map<String, List<Library>>> = _authorGroups.asStateFlow()
    
    private val _seriesGroups = MutableStateFlow<Map<String, List<Library>>>(emptyMap())
    val seriesGroups: StateFlow<Map<String, List<Library>>> = _seriesGroups.asStateFlow()
    
    private val _systemLists = MutableStateFlow<Map<SystemList, List<Library>>>(emptyMap())
    val systemLists: StateFlow<Map<SystemList, List<Library>>> = _systemLists.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadAuthorGroups(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                libraryRepository.getLibrary(userId).collect { libraryItems ->
                    val grouped = libraryItems.groupBy { item ->
                        // TODO: Get author from story
                        storyRepository.getStory(item.storyId).collect { story ->
                            story?.author ?: "Unknown"
                        }
                    }
                    _authorGroups.value = grouped
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun loadSeriesGroups(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                libraryRepository.getLibrary(userId).collect { libraryItems ->
                    val grouped = libraryItems.groupBy { item ->
                        // TODO: Get series from story
                        storyRepository.getStory(item.storyId).collect { story ->
                            story?.series ?: "No Series"
                        }
                    }
                    _seriesGroups.value = grouped
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun loadSystemLists(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                libraryRepository.getLibrary(userId).collect { libraryItems ->
                    val favorites = libraryItems.filter { it.isFavorite }
                    val toRead = libraryItems.filter { /* TODO: Check reading progress */ true }
                    val haveRead = libraryItems.filter { /* TODO: Check completion status */ false }
                    val currentlyReading = libraryItems.filter { /* TODO: Check active reading */ false }
                    val recentlyAdded = libraryItems.sortedByDescending { it.addedAt }.take(20)
                    
                    _systemLists.value = mapOf(
                        SystemList.FAVORITES to favorites,
                        SystemList.TO_READ to toRead,
                        SystemList.HAVE_READ to haveRead,
                        SystemList.CURRENTLY_READING to currentlyReading,
                        SystemList.RECENTLY_ADDED to recentlyAdded
                    )
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}

