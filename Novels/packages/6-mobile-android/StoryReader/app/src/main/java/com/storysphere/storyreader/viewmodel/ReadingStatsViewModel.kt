package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.ReadingStats
import com.storysphere.storyreader.repository.ReadingProgressRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

@HiltViewModel
class ReadingStatsViewModel @Inject constructor(
    private val readingProgressRepository: ReadingProgressRepository,
    private val database: AppDatabase
) : ViewModel() {
    private val _stats = MutableStateFlow<ReadingStats?>(null)
    val stats: StateFlow<ReadingStats?> = _stats.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    fun loadStats(userId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            try {
                // Get all reading progress from database
                val allProgress = database.readingProgressDao().getAllProgressByUserId(userId)
                
                if (allProgress.isEmpty()) {
                    // No data yet, return empty stats
                    _stats.value = ReadingStats(
                        userId = userId,
                        totalReadingTime = 0,
                        totalWordsRead = 0,
                        totalChaptersRead = 0,
                        totalStoriesRead = 0,
                        averageReadingSpeed = 0,
                        longestReadingSession = 0,
                        currentStreak = 0,
                        longestStreak = 0,
                        lastReadAt = null
                    )
                } else {
                    // Calculate stats from reading progress
                    val totalReadingTime = allProgress.sumOf { it.readingTime } / (1000 * 60) // Convert to minutes
                    val totalWordsRead = allProgress.sumOf { 
                        // Estimate words from reading time and WPM
                        val wpm = it.wordsPerMinute ?: 200 // Default 200 WPM
                        (it.readingTime / (1000 * 60)) * wpm
                    }
                    val uniqueChapters = allProgress.map { it.chapterId }.distinct().size
                    val uniqueStories = allProgress.map { it.storyId }.distinct().size
                    val averageWPM = allProgress
                        .mapNotNull { it.wordsPerMinute }
                        .takeIf { it.isNotEmpty() }
                        ?.average()?.toInt() ?: 0
                    val longestSession = allProgress.maxOfOrNull { it.readingTime }?.div(1000 * 60)?.toInt() ?: 0
                    
                    // Calculate streaks (simplified - check consecutive days with reading activity)
                    val currentStreak = calculateCurrentStreak(allProgress)
                    val longestStreak = calculateLongestStreak(allProgress)
                    
                    val lastReadAt = allProgress.maxOfOrNull { it.lastReadAt } ?: System.currentTimeMillis()
                    
                    _stats.value = ReadingStats(
                        userId = userId,
                        totalReadingTime = totalReadingTime.toInt(),
                        totalWordsRead = totalWordsRead.toInt(),
                        totalChaptersRead = uniqueChapters,
                        totalStoriesRead = uniqueStories,
                        averageReadingSpeed = averageWPM,
                        longestReadingSession = longestSession,
                        currentStreak = currentStreak,
                        longestStreak = longestStreak,
                        lastReadAt = lastReadAt
                    )
                }
            } catch (e: Exception) {
                _error.value = e.message ?: "Failed to load reading statistics"
            } finally {
                _isLoading.value = false
            }
        }
    }
    
    private fun calculateCurrentStreak(progress: List<com.storysphere.storyreader.database.entity.ReadingProgressEntity>): Int {
        // Simplified streak calculation - count consecutive days with reading activity
        val daysWithActivity = progress
            .map { it.lastReadAt }
            .map { Calendar.getInstance().apply { timeInMillis = it }.get(Calendar.DAY_OF_YEAR) }
            .distinct()
            .sortedDescending()
        
        var streak = 0
        val today = Calendar.getInstance().get(Calendar.DAY_OF_YEAR)
        var expectedDay = today
        
        for (day in daysWithActivity) {
            if (day == expectedDay) {
                streak++
                expectedDay--
            } else {
                break
            }
        }
        
        return streak
    }
    
    private fun calculateLongestStreak(progress: List<com.storysphere.storyreader.database.entity.ReadingProgressEntity>): Int {
        // Simplified - return current streak as longest for now
        // In production, track historical streaks
        return calculateCurrentStreak(progress)
    }
    
    fun retry() {
        val userId = _stats.value?.userId ?: "user1"
        loadStats(userId)
    }
    
    fun clearError() {
        _error.value = null
    }
}

