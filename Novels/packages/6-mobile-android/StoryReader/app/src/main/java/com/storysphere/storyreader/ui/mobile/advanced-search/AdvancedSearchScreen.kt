package com.storysphere.storyreader.ui.mobile.advancedsearch

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.AdvancedSearchViewModel

@Composable
fun AdvancedSearchScreen(
    userId: String,
    viewModel: AdvancedSearchViewModel = hiltViewModel(),
    onSearch: (String) -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    val searchHistory by viewModel.searchHistory.collectAsState()
    val suggestions by viewModel.suggestions.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Advanced Search") })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = {
                    searchQuery = it
                    viewModel.updateQuery(it)
                },
                label = { Text("Search") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Suggestions
            if (suggestions.isNotEmpty()) {
                Text(
                    text = "Suggestions",
                    style = MaterialTheme.typography.titleSmall
                )
                suggestions.forEach { suggestion ->
                    SuggestionItem(
                        suggestion = suggestion.text,
                        onClick = {
                            searchQuery = suggestion.text
                            viewModel.updateQuery(suggestion.text)
                        }
                    )
                }
            }

            // Search History
            if (searchHistory.isNotEmpty()) {
                Text(
                    text = "Recent Searches",
                    style = MaterialTheme.typography.titleSmall
                )
                searchHistory.forEach { query ->
                    HistoryItem(
                        query = query.query,
                        onClick = {
                            searchQuery = query.query
                            viewModel.updateQuery(query.query)
                        },
                        onDelete = { viewModel.removeFromHistory(query.id) }
                    )
                }
            }

            // Search Button
            Button(
                onClick = {
                    viewModel.search(userId, searchQuery)
                    onSearch(searchQuery)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Search")
            }
        }
    }
}

@Composable
fun SuggestionItem(suggestion: String, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = suggestion,
            modifier = Modifier.padding(16.dp)
        )
    }
}

@Composable
fun HistoryItem(query: String, onClick: () -> Unit, onDelete: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        TextButton(onClick = onClick) {
            Text(query)
        }
        TextButton(onClick = onDelete) {
            Text("Delete")
        }
    }
}

