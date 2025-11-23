package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Post
import com.storysphere.storyreader.network.GraphQLService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FeedViewModel @Inject constructor(
    private val graphQLService: GraphQLService
) : ViewModel() {
    private val _posts = MutableStateFlow<List<Post>>(emptyList())
    val posts: StateFlow<List<Post>> = _posts.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadFeed(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            
            // TODO: Load from GraphQL
            // For now, mock data
            _posts.value = emptyList()
            _isLoading.value = false
        }
    }
    
    fun likePost(postId: String) {
        viewModelScope.launch {
            // TODO: Like post via GraphQL
            // Update local state optimistically
            _posts.value = _posts.value.map { post ->
                if (post.id == postId) {
                    post.copy(likes = post.likes + 1)
                } else {
                    post
                }
            }
        }
    }
    
    fun createPost(userId: String, content: String, images: List<String> = emptyList()) {
        viewModelScope.launch {
            // TODO: Create post via GraphQL
        }
    }
}

