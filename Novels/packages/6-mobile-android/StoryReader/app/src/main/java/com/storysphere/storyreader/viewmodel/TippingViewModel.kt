package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Tip
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TippingViewModel @Inject constructor(
    // TODO: Inject TippingRepository when created
) : ViewModel() {
    
    private val _tippingHistory = MutableStateFlow<List<Tip>>(emptyList())
    val tippingHistory: StateFlow<List<Tip>> = _tippingHistory.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun submitTip(storyId: String, authorId: String, amount: Int, message: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to submit tip
                // tippingRepository.tipAuthor(storyId, authorId, amount, message)
                loadTippingHistory(_tippingHistory.value.firstOrNull()?.userId ?: "")
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun loadTippingHistory(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to fetch tipping history
                // _tippingHistory.value = tippingRepository.getTippingHistory(userId)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}

