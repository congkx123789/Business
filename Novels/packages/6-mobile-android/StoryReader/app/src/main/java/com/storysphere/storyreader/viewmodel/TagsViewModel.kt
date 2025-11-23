package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Tag
import com.storysphere.storyreader.repository.TagRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class TagsViewModel @Inject constructor(
    private val tagRepository: TagRepository
) : ViewModel() {
    private val _tags = MutableStateFlow<List<Tag>>(emptyList())
    val tags: StateFlow<List<Tag>> = _tags.asStateFlow()
    
    private val _rootTags = MutableStateFlow<List<Tag>>(emptyList())
    val rootTags: StateFlow<List<Tag>> = _rootTags.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadTags(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                tagRepository.getTags(userId).collect { tags ->
                    _tags.value = tags
                    _isLoading.value = false
                }
            } catch (e: Exception) {
                _error.value = e.message
                _isLoading.value = false
            }
        }
    }
    
    fun loadRootTags(userId: String) {
        viewModelScope.launch {
            tagRepository.getRootTags(userId).collect { tags ->
                _rootTags.value = tags
            }
        }
    }
    
    fun createTag(
        userId: String,
        name: String,
        color: String? = null,
        icon: String? = null,
        parentId: String? = null
    ) {
        viewModelScope.launch {
            val tag = Tag(
                id = UUID.randomUUID().toString(),
                userId = userId,
                name = name,
                color = color,
                icon = icon,
                parentId = parentId,
                createdAt = System.currentTimeMillis()
            )
            
            tagRepository.createTag(tag).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
    
    fun deleteTag(tagId: String) {
        viewModelScope.launch {
            tagRepository.deleteTag(tagId).fold(
                onSuccess = { /* Already updated via Flow */ },
                onFailure = { error ->
                    _error.value = error.message
                }
            )
        }
    }
}

