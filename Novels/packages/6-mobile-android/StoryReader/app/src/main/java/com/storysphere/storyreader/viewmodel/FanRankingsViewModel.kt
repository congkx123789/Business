package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.TipSupporter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FanRankingsViewModel @Inject constructor(
    // TODO: Inject FanRankingsRepository when created
) : ViewModel() {
    
    private val _rankings = MutableStateFlow<List<TipSupporter>>(emptyList())
    val rankings: StateFlow<List<TipSupporter>> = _rankings.asStateFlow()
    
    private val _userRanking = MutableStateFlow<Int?>(null)
    val userRanking: StateFlow<Int?> = _userRanking.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadRankings(storyId: String? = null, authorId: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to fetch rankings
                // _rankings.value = fanRankingsRepository.getFanRankings(storyId, authorId)
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    fun loadUserRanking(userId: String, storyId: String? = null) {
        viewModelScope.launch {
            try {
                // TODO: Implement repository method to fetch user ranking
                // _userRanking.value = fanRankingsRepository.getUserRanking(userId, storyId)
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
