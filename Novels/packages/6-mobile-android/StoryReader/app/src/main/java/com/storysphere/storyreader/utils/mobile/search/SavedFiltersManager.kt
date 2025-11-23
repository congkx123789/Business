package com.storysphere.storyreader.utils.mobile.search

import com.storysphere.storyreader.model.FilterQuery
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SavedFiltersManager @Inject constructor(
    private val filterPresetsManager: FilterPresetsManager
) {
    suspend fun saveFilter(
        userId: String,
        name: String,
        filterQuery: FilterQuery
    ): String {
        return filterPresetsManager.savePreset(userId, name, filterQuery)
    }

    suspend fun loadFilter(presetId: String): FilterQuery? {
        return filterPresetsManager.getPreset(presetId)?.filterQuery
    }

    suspend fun deleteFilter(presetId: String) {
        filterPresetsManager.deletePreset(presetId)
    }

    fun observeFilters(userId: String) = filterPresetsManager.observePresets(userId)
}

