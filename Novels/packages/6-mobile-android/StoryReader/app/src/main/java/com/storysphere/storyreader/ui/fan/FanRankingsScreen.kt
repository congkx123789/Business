package com.storysphere.storyreader.ui.fan

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import com.storysphere.storyreader.model.TipSupporter
import com.storysphere.storyreader.ui.components.EmptyState
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.FanRankingsViewModel

@Composable
fun FanRankingsScreen(
    viewModel: FanRankingsViewModel = hiltViewModel(),
    storyId: String? = null,
    onBack: () -> Unit = {}
) {
    val rankings by viewModel.rankings.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(storyId) {
        viewModel.loadRankings(storyId = storyId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Fan Rankings") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> LoadingIndicator(modifier = Modifier.fillMaxSize())
            rankings.isEmpty() -> EmptyState(
                title = "No Supporters Yet",
                message = "Be the first to support this story."
            )
            else -> LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(
                    start = 16.dp,
                    end = 16.dp,
                    top = padding.calculateTopPadding() + 16.dp,
                    bottom = padding.calculateBottomPadding() + 16.dp
                )
            ) {
                itemsIndexed(rankings, key = { _, supporter -> supporter.userId }) { index, supporter ->
                    RankingRow(position = index + 1, supporter = supporter)
                }
            }
        }
    }
}

@Composable
private fun RankingRow(position: Int, supporter: TipSupporter) {
    Card(
        modifier = Modifier.fillMaxSize(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(text = "#$position")
            Column {
                Text(text = supporter.username)
                Text(text = "${supporter.totalAmount} points • ${supporter.tipCount} tips")
            }
        }
    }
}

