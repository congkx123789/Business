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
fun SearchSuggestionsScreen(
    currentInput: String,
    viewModel: AdvancedSearchViewModel = hiltViewModel(),
    onSuggestionSelected: (String) -> Unit = {}
) {
    val suggestions by viewModel.suggestions.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(suggestions) { suggestion ->
            SuggestionCard(
                suggestion = suggestion.text,
                type = suggestion.type.name,
                onClick = { onSuggestionSelected(suggestion.text) }
            )
        }
    }
}

@Composable
fun SuggestionCard(
    suggestion: String,
    type: String,
    onClick: () -> Unit
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
            Text(
                text = suggestion,
                style = MaterialTheme.typography.bodyLarge
            )
            Text(
                text = type,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

