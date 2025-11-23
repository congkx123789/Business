package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.FilteredView
import com.storysphere.storyreader.model.FilterQuery
import com.storysphere.storyreader.repository.LibraryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FilteredViewViewModel @Inject constructor(
    private val libraryRepository: LibraryRepository
) : ViewModel() {
    
    private val _filteredViews = MutableStateFlow<List<FilteredView>>(emptyList())
    val filteredViews: StateFlow<List<FilteredView>> = _filteredViews.asStateFlow()
    
    private val _currentView = MutableStateFlow<FilteredView?>(null)
    val currentView: StateFlow<FilteredView?> = _currentView.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadFilteredViews(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to fetch filtered views
                // _filteredViews.value = filteredViewRepository.getFilteredViews(userId)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun createFilteredView(userId: String, name: String, query: FilterQuery) {
        viewModelScope.launch {
            try {
                // TODO: Implement repository method to create filtered view
                // filteredViewRepository.createFilteredView(userId, name, query)
                loadFilteredViews(userId)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun updateFilteredView(viewId: String, name: String?, query: FilterQuery?) {
        viewModelScope.launch {
            try {
                // TODO: Implement repository method to update filtered view
                // filteredViewRepository.updateFilteredView(viewId, name, query)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun deleteFilteredView(viewId: String) {
        viewModelScope.launch {
            try {
                // TODO: Implement repository method to delete filtered view
                // filteredViewRepository.deleteFilteredView(viewId)
                loadFilteredViews(_filteredViews.value.firstOrNull()?.userId ?: "")
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
    
    fun selectView(view: FilteredView) {
        _currentView.value = view
    }
}

