package com.storysphere.storyreader.ui.mobile.bulkoperations

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Label
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.BulkOperationsViewModel

@Composable
fun BulkActionBar(
    viewModel: BulkOperationsViewModel = hiltViewModel(),
    onDelete: () -> Unit = {},
    onMoveToBookshelf: () -> Unit = {},
    onAddTags: () -> Unit = {},
    onDeselectAll: () -> Unit = {}
) {
    val selectedItems by viewModel.selectedItems.collectAsState()
    val selectedCount = selectedItems.size

    if (selectedCount > 0) {
        Surface(
            modifier = Modifier.fillMaxWidth(),
            tonalElevation = 8.dp
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "$selectedCount selected",
                    style = MaterialTheme.typography.titleMedium
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = onDelete) {
                        Icon(
                            imageVector = Icons.Filled.Delete,
                            contentDescription = "Delete",
                            tint = MaterialTheme.colorScheme.error
                        )
                    }

                    IconButton(onClick = onMoveToBookshelf) {
                        Icon(
                            imageVector = Icons.Filled.Folder,
                            contentDescription = "Move to bookshelf"
                        )
                    }

                    IconButton(onClick = onAddTags) {
                        Icon(
                            imageVector = Icons.Filled.Label,
                            contentDescription = "Add tags"
                        )
                    }

                    TextButton(onClick = onDeselectAll) {
                        Text("Cancel")
                    }
                }
            }
        }
    }
}

