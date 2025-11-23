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
fun FilterPresetsScreen(
    userId: String,
    viewModel: AdvancedSearchViewModel = hiltViewModel(),
    onPresetSelected: (String) -> Unit = {}
) {
    val filterPresets by viewModel.filterPresets.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Filter Presets") })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Create new preset */ }) {
                Text("+")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(filterPresets) { preset ->
                FilterPresetCard(
                    preset = preset,
                    onClick = { onPresetSelected(preset.id) },
                    onDelete = { viewModel.deletePreset(preset.id) }
                )
            }
        }
    }
}

@Composable
fun FilterPresetCard(
    preset: com.storysphere.storyreader.utils.mobile.search.FilterPreset,
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
                    text = preset.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "Last used: ${java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
                        .format(java.util.Date(preset.lastUsedAt))}",
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

