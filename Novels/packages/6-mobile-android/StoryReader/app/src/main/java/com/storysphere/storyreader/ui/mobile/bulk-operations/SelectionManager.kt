package com.storysphere.storyreader.ui.mobile.bulkoperations

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.BulkOperationsViewModel

@Composable
fun SelectionManager(
    viewModel: BulkOperationsViewModel = hiltViewModel()
): SelectionState {
    val selectedItems by viewModel.selectedItems.collectAsState()
    val isSelectionMode by viewModel.isSelectionMode.collectAsState()

    return SelectionState(
        selectedItems = selectedItems,
        isSelectionMode = isSelectionMode,
        selectedCount = selectedItems.size,
        hasSelection = selectedItems.isNotEmpty()
    )
}

data class SelectionState(
    val selectedItems: Set<String>,
    val isSelectionMode: Boolean,
    val selectedCount: Int,
    val hasSelection: Boolean
)

