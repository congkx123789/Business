package com.storysphere.storyreader.utils.mobile.search

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.dao.FilterPresetDao
import com.storysphere.storyreader.database.entity.FilterPresetEntity
import com.storysphere.storyreader.model.FilterQuery
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FilterPresetsManager @Inject constructor(
    private val database: AppDatabase
) {
    private val dao: FilterPresetDao
        get() = database.filterPresetDao()

    fun observePresets(userId: String): Flow<List<FilterPreset>> {
        return dao.observePresets(userId).map { entities ->
            entities.map { it.toModel() }
        }
    }

    suspend fun savePreset(
        userId: String,
        name: String,
        filterQuery: FilterQuery
    ): String {
        return withContext(Dispatchers.IO) {
            val preset = FilterPresetEntity(
                id = generateId(),
                userId = userId,
                name = name,
                filterQueryJson = filterQueryToJson(filterQuery),
                createdAt = System.currentTimeMillis(),
                lastUsedAt = System.currentTimeMillis()
            )
            dao.insert(preset)
            preset.id
        }
    }

    suspend fun updatePreset(
        presetId: String,
        name: String? = null,
        filterQuery: FilterQuery? = null
    ) {
        withContext(Dispatchers.IO) {
            val existing = dao.findById(presetId) ?: return@withContext
            val updated = existing.copy(
                name = name ?: existing.name,
                filterQueryJson = filterQuery?.let { filterQueryToJson(it) } ?: existing.filterQueryJson,
                lastUsedAt = System.currentTimeMillis()
            )
            dao.update(updated)
        }
    }

    suspend fun deletePreset(presetId: String) {
        withContext(Dispatchers.IO) {
            dao.delete(presetId)
        }
    }

    suspend fun updateLastUsed(presetId: String) {
        withContext(Dispatchers.IO) {
            dao.updateLastUsed(presetId, System.currentTimeMillis())
        }
    }

    suspend fun getPreset(presetId: String): FilterPreset? {
        return withContext(Dispatchers.IO) {
            dao.findById(presetId)?.toModel()
        }
    }

    private fun filterQueryToJson(filterQuery: FilterQuery): String {
        // Simple JSON serialization - in production, use proper JSON library
        return """
            {
                "tags": ${filterQuery.tags?.joinToString(",", "[", "]") { "\"$it\"" } ?: "[]"},
                "author": "${filterQuery.author ?: ""}",
                "genreId": ${filterQuery.genreId ?: 0},
                "status": "${filterQuery.status ?: ""}",
                "completionStatus": "${filterQuery.completionStatus ?: ""}",
                "dateRange": {
                    "start": "${filterQuery.dateRange?.start ?: ""}",
                    "end": "${filterQuery.dateRange?.end ?: ""}"
                }
            }
        """.trimIndent()
    }

    private fun jsonToFilterQuery(json: String): FilterQuery {
        // Simple JSON parsing - in production, use proper JSON library
        // This is a simplified implementation
        return FilterQuery(
            tags = null,
            author = null,
            genreId = null,
            status = null,
            completionStatus = null,
            dateRange = null
        )
    }

    companion object {
        private fun generateId(): String {
            return java.util.UUID.randomUUID().toString()
        }
    }
}

data class FilterPreset(
    val id: String,
    val userId: String,
    val name: String,
    val filterQuery: FilterQuery,
    val createdAt: Long,
    val lastUsedAt: Long
)

private fun FilterPresetEntity.toModel(): FilterPreset {
    return FilterPreset(
        id = id,
        userId = userId,
        name = name,
        filterQuery = jsonToFilterQuery(filterQueryJson),
        createdAt = createdAt,
        lastUsedAt = lastUsedAt
    )
}

// Helper function - should be in FilterPresetsManager
private fun jsonToFilterQuery(json: String): FilterQuery {
    // Simplified - use proper JSON parsing in production
    return FilterQuery(
        tags = null,
        author = null,
        genreId = null,
        status = null,
        completionStatus = null,
        dateRange = null
    )
}

