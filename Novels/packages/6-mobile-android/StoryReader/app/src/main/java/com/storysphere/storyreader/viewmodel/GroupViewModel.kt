package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Group
import com.storysphere.storyreader.network.GraphQLService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class GroupViewModel @Inject constructor(
    private val graphQLService: GraphQLService
) : ViewModel() {
    private val _groups = MutableStateFlow<List<Group>>(emptyList())
    val groups: StateFlow<List<Group>> = _groups.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadGroups() {
        viewModelScope.launch {
            _isLoading.value = true
            
            // TODO: Load from GraphQL
            // For now, mock data
            _groups.value = emptyList()
            _isLoading.value = false
        }
    }
    
    fun joinGroup(groupId: String) {
        viewModelScope.launch {
            // TODO: Join group via GraphQL
        }
    }
    
    fun createGroup(name: String, description: String?, isPrivate: Boolean = false) {
        viewModelScope.launch {
            // TODO: Create group via GraphQL
        }
    }
}

