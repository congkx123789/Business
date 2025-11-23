package com.storysphere.storyreader.ui.mobile.advancedsearch

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.AdvancedSearchViewModel

@Composable
fun SearchHistoryScreen(
    userId: String,
    viewModel: AdvancedSearchViewModel = hiltViewModel(),
    onQuerySelected: (String) -> Unit = {}
) {
    val searchHistory by viewModel.searchHistory.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Search History") },
                actions = {
                    TextButton(onClick = { viewModel.clearHistory(userId) }) {
                        Text("Clear")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(searchHistory) { query ->
                SearchHistoryItem(
                    query = query.query,
                    searchedAt = query.searchedAt,
                    onClick = { onQuerySelected(query.query) },
                    onDelete = { viewModel.removeFromHistory(query.id) }
                )
            }
        }
    }
}

@Composable
fun SearchHistoryItem(
    query: String,
    searchedAt: Long,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = query,
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    text = java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
                        .format(java.util.Date(searchedAt)),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            TextButton(onClick = onDelete) {
                Text("Delete")
            }
        }
    }
}

