package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.network.GraphQLService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PaywallViewModel @Inject constructor(
    private val graphQLService: GraphQLService
) : ViewModel() {
    
    private val _showPaywall = MutableStateFlow(false)
    val showPaywall: StateFlow<Boolean> = _showPaywall.asStateFlow()
    
    private val _freeChaptersRemaining = MutableStateFlow(0)
    val freeChaptersRemaining: StateFlow<Int> = _freeChaptersRemaining.asStateFlow()
    
    private val _chapterPrice = MutableStateFlow<Int?>(null)
    val chapterPrice: StateFlow<Int?> = _chapterPrice.asStateFlow()
    
    private val _isPurchasing = MutableStateFlow(false)
    val isPurchasing: StateFlow<Boolean> = _isPurchasing.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private var retryCount = 0
    private val maxRetries = 3
    private val retryDelayMs = 1000L
    
    fun checkPaywall(storyId: String, chapterId: String, retry: Boolean = false) {
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            try {
                _isLoading.value = true
                if (!retry) {
                    _error.value = null
                }
                
                // TODO: Implement repository method to check paywall
                // For now, use placeholder logic
                // val paywallInfo = graphQLService.getPaywallInfo(storyId, chapterId)
                // _showPaywall.value = paywallInfo.showPaywall
                // _freeChaptersRemaining.value = paywallInfo.freeChaptersRemaining
                // _chapterPrice.value = paywallInfo.chapterPrice
                _showPaywall.value = false
                _freeChaptersRemaining.value = 5
                _chapterPrice.value = 10
                _isLoading.value = false
                retryCount = 0
            } catch (e: Exception) {
                if (retryCount < maxRetries) {
                    retryCount++
                    delay(retryDelayMs * retryCount) // Exponential backoff
                    checkPaywall(storyId, chapterId, retry = true)
                } else {
                    _error.value = e.message ?: "Failed to check paywall after $maxRetries retries"
                    _isLoading.value = false
                    retryCount = 0
                }
            }
        }
    }
    
    fun purchaseChapter(userId: String, chapterId: String) {
        viewModelScope.launch {
            _isPurchasing.value = true
            _error.value = null
            
            try {
                // Optimistic update - hide paywall immediately
                val wasShowing = _showPaywall.value
                _showPaywall.value = false
                
                // Implement repository method to purchase chapter
                val result = graphQLService.purchaseChapter(chapterId)
                result.fold(
                    onSuccess = { chapter ->
                        // Purchase successful
                    },
                    onFailure = { error ->
                        // Rollback optimistic update
                        _showPaywall.value = wasShowing
                        _error.value = error.message ?: "Purchase failed"
                    }
                )
            } catch (e: Exception) {
                // Rollback optimistic update
                _showPaywall.value = true
                _error.value = e.message ?: "Failed to purchase chapter"
            } finally {
                _isPurchasing.value = false
            }
        }
    }
    
    fun retryCheckPaywall(storyId: String, chapterId: String) {
        checkPaywall(storyId, chapterId, retry = true)
    }
    
    fun dismissPaywall() {
        _showPaywall.value = false
    }
    
    fun clearError() {
        _error.value = null
    }
}

