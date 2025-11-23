package com.storysphere.storyreader.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.ui.components.EmptyState
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.ui.components.StoryCard
import com.storysphere.storyreader.viewmodel.RecommendationsViewModel

@Composable
fun RecommendationsScreen(
    viewModel: RecommendationsViewModel = hiltViewModel(),
    userId: String,
    onBack: () -> Unit = {},
    onStorySelected: (Story) -> Unit = {}
) {
    val recommendations by viewModel.recommendations.collectAsState()
    val trending by viewModel.trending.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadRecommendations(userId)
        viewModel.loadTrending()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Recommendations") },
                navigationIcon = { BackIcon(onBack) },
                actions = {
                    IconButton(onClick = {
                        viewModel.loadRecommendations(userId)
                        viewModel.loadTrending()
                    }) {
                        Icon(Icons.Rounded.Refresh, contentDescription = "Refresh")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { viewModel.loadRecommendations(userId) }) {
                Icon(Icons.Rounded.Refresh, contentDescription = "Reload")
            }
        }
    ) { padding ->
        when {
            isLoading -> LoadingIndicator(modifier = Modifier.padding(padding))
            else -> RecommendationsContent(
                padding = padding,
                recommendations = recommendations,
                trending = trending,
                onStorySelected = onStorySelected
            )
        }
    }
}

@Composable
private fun RecommendationsContent(
    padding: PaddingValues,
    recommendations: List<Story>,
    trending: List<Story>,
    onStorySelected: (Story) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(text = "For You", style = MaterialTheme.typography.titleLarge)
        }
        if (recommendations.isEmpty()) {
            item {
                EmptyState(
                    title = "No recommendations yet",
                    message = "Read a few chapters and we will personalize this space."
                )
            }
        } else {
            items(recommendations, key = { it.id }) { story ->
                StoryCard(story = story, onClick = { onStorySelected(story) })
            }
        }
        if (trending.isNotEmpty()) {
            item {
                Text(text = "Trending Now", style = MaterialTheme.typography.titleLarge)
            }
            items(trending, key = { "trending-${it.id}" }) { story ->
                StoryCard(story = story, onClick = { onStorySelected(story) })
            }
        }
    }
}

@Composable
private fun BackIcon(onBack: () -> Unit) {
    IconButton(onClick = onBack) {
        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
    }
}

