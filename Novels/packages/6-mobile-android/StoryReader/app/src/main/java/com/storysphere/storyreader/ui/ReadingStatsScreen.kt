package com.storysphere.storyreader.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.ReadingStatsViewModel
import com.storysphere.storyreader.ui.mobile.readingstats.ReadingTimeChart
import com.storysphere.storyreader.ui.mobile.readingstats.ReadingTimeDataPoint
import com.storysphere.storyreader.ui.mobile.readingstats.ProgressChart
import com.storysphere.storyreader.ui.mobile.readingstats.ProgressDataPoint
import com.storysphere.storyreader.ui.mobile.readingstats.WPMTracker

@Composable
fun ReadingStatsScreen(
    viewModel: ReadingStatsViewModel = hiltViewModel(),
    userId: String = "user1",
    onNavigateBack: () -> Unit = {}
) {
    val stats by viewModel.stats.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadStats(userId)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Reading Statistics") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Text("←")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            LoadingIndicator(modifier = Modifier.padding(padding))
        } else {
            stats?.let { readingStats ->
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState())
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    // Overview Cards
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(
                            title = "Total Time",
                            value = "${readingStats.totalReadingTime / 60}h",
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Words Read",
                            value = "${readingStats.totalWordsRead / 1000}k",
                            modifier = Modifier.weight(1f)
                        )
                    }
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(
                            title = "Chapters",
                            value = "${readingStats.totalChaptersRead}",
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Stories",
                            value = "${readingStats.totalStoriesRead}",
                            modifier = Modifier.weight(1f)
                        )
                    }
                    
                    // Streaks
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Reading Streaks",
                                style = MaterialTheme.typography.titleMedium
                            )
                            StatRow(
                                label = "Current Streak",
                                value = "${readingStats.currentStreak} days"
                            )
                            StatRow(
                                label = "Longest Streak",
                                value = "${readingStats.longestStreak} days"
                            )
                        }
                    }
                    
                    // WPM Tracker
                    WPMTracker(
                        currentWPM = readingStats.averageReadingSpeed.toDouble(),
                        averageWPM = readingStats.averageReadingSpeed.toDouble(),
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    // Reading Time Chart
                    ReadingTimeChart(
                        data = listOf(
                            ReadingTimeDataPoint("Mon", 30.0),
                            ReadingTimeDataPoint("Tue", 45.0),
                            ReadingTimeDataPoint("Wed", 20.0),
                            ReadingTimeDataPoint("Thu", 60.0),
                            ReadingTimeDataPoint("Fri", 35.0),
                            ReadingTimeDataPoint("Sat", 50.0),
                            ReadingTimeDataPoint("Sun", 40.0)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    // Progress Chart
                    ProgressChart(
                        progressData = listOf(
                            ProgressDataPoint("Story 1", 75.0),
                            ProgressDataPoint("Story 2", 50.0),
                            ProgressDataPoint("Story 3", 100.0),
                            ProgressDataPoint("Story 4", 25.0)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    // Performance
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Performance",
                                style = MaterialTheme.typography.titleMedium
                            )
                            StatRow(
                                label = "Average Speed",
                                value = "${readingStats.averageReadingSpeed} wpm"
                            )
                            StatRow(
                                label = "Longest Session",
                                value = "${readingStats.longestReadingSession} minutes"
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun StatRow(
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

