package com.storysphere.storyreader.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.ui.components.StoryCard
import com.storysphere.storyreader.viewmodel.RankingType
import com.storysphere.storyreader.viewmodel.RankingsViewModel

@Composable
fun RankingsScreen(
    viewModel: RankingsViewModel = hiltViewModel(),
    onBack: () -> Unit = {}
) {
    val monthlyVotes by viewModel.monthlyVotesRanking.collectAsState()
    val sales by viewModel.salesRanking.collectAsState()
    val recommendations by viewModel.recommendationsRanking.collectAsState()
    val popularity by viewModel.popularityRanking.collectAsState()
    val rankings = listOf(
        RankingType.MONTHLY_VOTES to monthlyVotes,
        RankingType.SALES to sales,
        RankingType.RECOMMENDATIONS to recommendations,
        RankingType.POPULARITY to popularity
    )
    var selectedIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(selectedIndex) {
        val (type, _) = rankings[selectedIndex]
        viewModel.loadRankings(type)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Rankings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize()) {
            TabRow(selectedTabIndex = selectedIndex) {
                rankings.forEachIndexed { index, entry ->
                    Tab(
                        selected = index == selectedIndex,
                        onClick = { selectedIndex = index },
                        text = { Text(entry.first.label) }
                    )
                }
            }
            val stories = rankings[selectedIndex].second
            RankingsList(
                stories = stories,
                contentPadding = PaddingValues(
                    start = 16.dp,
                    end = 16.dp,
                    top = padding.calculateTopPadding() + 16.dp,
                    bottom = padding.calculateBottomPadding() + 16.dp
                )
            )
        }
    }
}

@Composable
private fun RankingsList(
    stories: List<Story>,
    contentPadding: PaddingValues
) {
    if (stories.isEmpty()) {
        EmptyState(
            title = "No data yet",
            message = "Rankings will appear once data syncs.",
            modifier = Modifier.fillMaxSize()
        )
        return
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = contentPadding,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(stories, key = { it.id }) { story ->
            StoryCard(story = story)
        }
    }
}

private val RankingType.label: String
    get() = when (this) {
        RankingType.MONTHLY_VOTES -> "Monthly Votes"
        RankingType.SALES -> "Sales"
        RankingType.RECOMMENDATIONS -> "Recommendations"
        RankingType.POPULARITY -> "Popularity"
    }

