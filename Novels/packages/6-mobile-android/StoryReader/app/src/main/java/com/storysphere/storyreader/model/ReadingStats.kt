package com.storysphere.storyreader.model

data class ReadingStats(
    val userId: String,
    val totalReadingTime: Long = 0, // in minutes
    val totalWordsRead: Long = 0,
    val totalChaptersRead: Int = 0,
    val totalStoriesRead: Int = 0,
    val averageReadingSpeed: Int = 0, // words per minute
    val longestReadingSession: Long = 0, // in minutes
    val currentStreak: Int = 0, // days
    val longestStreak: Int = 0, // days
    val lastReadAt: Long? = null
)

data class DailyReadingGoal(
    val userId: String,
    val targetMinutes: Int = 30,
    val currentMinutes: Int = 0,
    val date: Long = System.currentTimeMillis()
)

