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
class RankingsViewModel @Inject constructor(
    private val storyRepository: StoryRepository
) : ViewModel() {
    
    private val _monthlyVotesRanking = MutableStateFlow<List<Story>>(emptyList())
    val monthlyVotesRanking: StateFlow<List<Story>> = _monthlyVotesRanking.asStateFlow()
    
    private val _salesRanking = MutableStateFlow<List<Story>>(emptyList())
    val salesRanking: StateFlow<List<Story>> = _salesRanking.asStateFlow()
    
    private val _recommendationsRanking = MutableStateFlow<List<Story>>(emptyList())
    val recommendationsRanking: StateFlow<List<Story>> = _recommendationsRanking.asStateFlow()
    
    private val _popularityRanking = MutableStateFlow<List<Story>>(emptyList())
    val popularityRanking: StateFlow<List<Story>> = _popularityRanking.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    fun loadRankings(rankingType: RankingType, genre: String? = null, timeRange: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                // TODO: Implement repository method to fetch rankings
                // val rankings = storyRepository.getRankings(rankingType, genre, timeRange)
                when (rankingType) {
                    RankingType.MONTHLY_VOTES -> {
                        // _monthlyVotesRanking.value = rankings
                    }
                    RankingType.SALES -> {
                        // _salesRanking.value = rankings
                    }
                    RankingType.RECOMMENDATIONS -> {
                        // _recommendationsRanking.value = rankings
                    }
                    RankingType.POPULARITY -> {
                        // _popularityRanking.value = rankings
                    }
                }
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isLoading.value = false
            }
        }
    }
}

enum class RankingType {
    MONTHLY_VOTES,
    SALES,
    RECOMMENDATIONS,
    POPULARITY
}

