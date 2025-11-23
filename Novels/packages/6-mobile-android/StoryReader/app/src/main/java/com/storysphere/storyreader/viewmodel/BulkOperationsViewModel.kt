package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.utils.mobile.bulk.BulkItemType
import com.storysphere.storyreader.utils.mobile.bulk.BulkOperationManager
import com.storysphere.storyreader.utils.mobile.bulk.BulkOperationResult
import com.storysphere.storyreader.utils.mobile.bulk.SelectionStateManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BulkOperationsViewModel @Inject constructor(
    private val selectionStateManager: SelectionStateManager,
    private val bulkOperationManager: BulkOperationManager
) : ViewModel() {

    val selectedItems: StateFlow<Set<String>> = selectionStateManager.selectedItems
    val isSelectionMode: StateFlow<Boolean> = selectionStateManager.isSelectionMode

    fun toggleSelection(itemId: String) {
        selectionStateManager.toggleSelection(itemId)
    }

    fun selectItem(itemId: String) {
        selectionStateManager.selectItem(itemId)
    }

    fun deselectItem(itemId: String) {
        selectionStateManager.deselectItem(itemId)
    }

    fun selectAll(itemIds: List<String>) {
        selectionStateManager.selectAll(itemIds)
    }

    fun deselectAll() {
        selectionStateManager.deselectAll()
    }

    fun clearSelection() {
        selectionStateManager.clearSelection()
    }

    fun enterSelectionMode() {
        selectionStateManager.enterSelectionMode()
    }

    fun exitSelectionMode() {
        selectionStateManager.exitSelectionMode()
    }

    fun isSelected(itemId: String): Boolean {
        return selectionStateManager.isSelected(itemId)
    }

    fun getSelectedCount(): Int {
        return selectionStateManager.getSelectedCount()
    }

    fun hasSelection(): Boolean {
        return selectionStateManager.hasSelection()
    }

    suspend fun deleteItems(
        itemIds: List<String>,
        itemType: BulkItemType
    ): BulkOperationResult {
        return bulkOperationManager.deleteItems(itemIds, itemType)
    }

    suspend fun moveToBookshelf(
        itemIds: List<String>,
        bookshelfId: String
    ): BulkOperationResult {
        return bulkOperationManager.moveToBookshelf(itemIds, bookshelfId)
    }

    suspend fun addTags(
        itemIds: List<String>,
        tags: List<String>
    ): BulkOperationResult {
        return bulkOperationManager.addTags(itemIds, tags)
    }

    suspend fun removeTags(
        itemIds: List<String>,
        tags: List<String>
    ): BulkOperationResult {
        return bulkOperationManager.removeTags(itemIds, tags)
    }

    suspend fun markAsRead(itemIds: List<String>): BulkOperationResult {
        return bulkOperationManager.markAsRead(itemIds)
    }

    suspend fun markAsUnread(itemIds: List<String>): BulkOperationResult {
        return bulkOperationManager.markAsUnread(itemIds)
    }
}

