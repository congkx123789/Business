package com.storysphere.storyreader.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.StorefrontViewModel
import com.storysphere.storyreader.navigation.Screen
import androidx.navigation.NavController

@Composable
fun StorefrontScreen(
    viewModel: StorefrontViewModel = hiltViewModel(),
    navController: NavController? = null,
    onNavigateToStory: (String) -> Unit = {}
) {
    val rankings by viewModel.rankings.collectAsState()
    val editorPicks by viewModel.editorPicks.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadRankings()
        viewModel.loadEditorPicks()
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Discover") }
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                // Editor's Picks Section
                item {
                    Text(
                        text = "Editor's Picks",
                        style = MaterialTheme.typography.headlineSmall
                    )
                }
                
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(editorPicks) { story ->
                            StoryCard(
                                story = story,
                                onClick = { onNavigateToStory(story.id) }
                            )
                        }
                    }
                }
                
                // Rankings Section
                item {
                    Text(
                        text = "Rankings",
                        style = MaterialTheme.typography.headlineSmall
                    )
                }
                
                items(rankings) { ranking ->
                    RankingItem(
                        ranking = ranking,
                        onClick = { onNavigateToStory(ranking.storyId) }
                    )
                }
                
                // Polls Section
                item {
                    Text(
                        text = "Polls",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }
                
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                navController?.navigate(Screen.Polls.route)
                            },
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "View All Polls",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("→")
                        }
                    }
                }
                
                // Quizzes Section
                item {
                    Text(
                        text = "Quizzes",
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(top = 16.dp)
                    )
                }
                
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                navController?.navigate(Screen.Quizzes.route)
                            },
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "View All Quizzes",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text("→")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StoryCard(
    story: com.storysphere.storyreader.model.Story,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // TODO: Add cover image
            Text(
                text = story.title,
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(8.dp)
            )
            Text(
                text = story.author,
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}

@Composable
fun RankingItem(
    ranking: RankingItem,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "#${ranking.rank}",
                style = MaterialTheme.typography.headlineMedium
            )
            Column(modifier = Modifier.weight(1f).padding(horizontal = 16.dp)) {
                Text(
                    text = ranking.title,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = ranking.author,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            Text(
                text = "${ranking.score}",
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

data class RankingItem(
    val rank: Int,
    val storyId: String,
    val title: String,
    val author: String,
    val score: Int
)

