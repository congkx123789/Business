package com.storysphere.storyreader.ui.mobile.commandpalette

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.CommandPaletteViewModel

@Composable
fun CommandPaletteScreen(
    userId: String,
    viewModel: CommandPaletteViewModel = hiltViewModel(),
    onCommandSelected: (CommandResult) -> Unit = {},
    onDismiss: () -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    val results by viewModel.searchResults.collectAsState()

    LaunchedEffect(searchQuery) {
        viewModel.search(userId, searchQuery)
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            // Search Bar (Material 3 SearchBar)
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                label = { Text("Search stories, chapters, annotations...") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search"
                    )
                }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Results
            CommandPaletteResults(
                results = results,
                onResultSelected = { result ->
                    onCommandSelected(result)
                    onDismiss()
                }
            )
        }
    }
}

data class CommandResult(
    val type: ResultType,
    val id: String,
    val title: String,
    val subtitle: String? = null
)

enum class ResultType {
    STORY,
    CHAPTER,
    ANNOTATION,
    SETTING,
    ACTION
}

