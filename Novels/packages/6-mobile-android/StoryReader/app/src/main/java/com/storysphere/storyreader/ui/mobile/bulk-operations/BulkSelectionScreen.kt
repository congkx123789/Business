package com.storysphere.storyreader.ui.mobile.bulkoperations

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.outlined.Circle
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.Library
import com.storysphere.storyreader.viewmodel.BulkOperationsViewModel

@Composable
fun BulkSelectionScreen(
    items: List<Library>,
    viewModel: BulkOperationsViewModel = hiltViewModel(),
    onSelectionChanged: (Set<String>) -> Unit = {},
    onItemClick: (String) -> Unit = {}
) {
    val selectedItems by viewModel.selectedItems.collectAsState()
    val isSelectionMode by viewModel.isSelectionMode.collectAsState()

    LaunchedEffect(selectedItems) {
        onSelectionChanged(selectedItems)
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(items) { item ->
            BulkSelectionItem(
                item = item,
                isSelected = selectedItems.contains(item.id),
                onToggleSelection = { viewModel.toggleSelection(item.id) },
                onItemClick = { onItemClick(item.id) }
            )
        }
    }
}

@Composable
fun BulkSelectionItem(
    item: Library,
    isSelected: Boolean,
    onToggleSelection: () -> Unit,
    onItemClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggleSelection() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = if (isSelected) Icons.Filled.CheckCircle else Icons.Outlined.Circle,
                contentDescription = if (isSelected) "Selected" else "Not selected",
                tint = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                modifier = Modifier.size(24.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.storyId, // In production, show story title
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = "Added: ${item.addedAt ?: "Unknown"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

