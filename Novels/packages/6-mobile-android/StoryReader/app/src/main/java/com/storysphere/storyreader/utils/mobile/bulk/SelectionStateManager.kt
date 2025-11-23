package com.storysphere.storyreader.utils.mobile.bulk

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SelectionStateManager @Inject constructor() {
    private val _selectedItems = MutableStateFlow<Set<String>>(emptySet())
    val selectedItems: StateFlow<Set<String>> = _selectedItems.asStateFlow()

    private val _isSelectionMode = MutableStateFlow(false)
    val isSelectionMode: StateFlow<Boolean> = _isSelectionMode.asStateFlow()

    fun toggleSelection(itemId: String) {
        val current = _selectedItems.value.toMutableSet()
        if (current.contains(itemId)) {
            current.remove(itemId)
        } else {
            current.add(itemId)
        }
        _selectedItems.value = current
    }

    fun selectItem(itemId: String) {
        val current = _selectedItems.value.toMutableSet()
        current.add(itemId)
        _selectedItems.value = current
    }

    fun deselectItem(itemId: String) {
        val current = _selectedItems.value.toMutableSet()
        current.remove(itemId)
        _selectedItems.value = current
    }

    fun selectAll(itemIds: List<String>) {
        _selectedItems.value = itemIds.toSet()
    }

    fun deselectAll() {
        _selectedItems.value = emptySet()
    }

    fun clearSelection() {
        _selectedItems.value = emptySet()
        _isSelectionMode.value = false
    }

    fun enterSelectionMode() {
        _isSelectionMode.value = true
    }

    fun exitSelectionMode() {
        _isSelectionMode.value = false
        _selectedItems.value = emptySet()
    }

    fun isSelected(itemId: String): Boolean {
        return _selectedItems.value.contains(itemId)
    }

    fun getSelectedCount(): Int {
        return _selectedItems.value.size
    }

    fun hasSelection(): Boolean {
        return _selectedItems.value.isNotEmpty()
    }
}

