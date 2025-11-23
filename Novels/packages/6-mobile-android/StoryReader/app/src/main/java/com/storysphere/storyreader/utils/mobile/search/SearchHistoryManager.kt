package com.storysphere.storyreader.utils.mobile.search

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.dao.SearchHistoryDao
import com.storysphere.storyreader.database.entity.SearchHistoryEntity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SearchHistoryManager @Inject constructor(
    private val database: AppDatabase
) {
    private val dao: SearchHistoryDao
        get() = database.searchHistoryDao()

    fun observeHistory(userId: String, limit: Int = DEFAULT_HISTORY_LIMIT): Flow<List<SearchQuery>> {
        return dao.observeHistory(userId, limit).map { entities ->
            entities.map { it.toModel() }
        }
    }

    suspend fun addQuery(userId: String, query: String, queryType: QueryType = QueryType.STORY) {
        withContext(Dispatchers.IO) {
            val existing = dao.findQuery(userId, query, queryType.name)
            if (existing != null) {
                // Update timestamp
                dao.updateTimestamp(existing.id, System.currentTimeMillis())
            } else {
                // Insert new
                dao.insert(
                    SearchHistoryEntity(
                        id = generateId(),
                        userId = userId,
                        query = query,
                        queryType = queryType.name,
                        searchedAt = System.currentTimeMillis()
                    )
                )
            }
            // Trim history
            dao.trimHistory(userId, DEFAULT_HISTORY_LIMIT)
        }
    }

    suspend fun clearHistory(userId: String) {
        withContext(Dispatchers.IO) {
            dao.deleteByUserId(userId)
        }
    }

    suspend fun removeQuery(queryId: String) {
        withContext(Dispatchers.IO) {
            dao.delete(queryId)
        }
    }

    suspend fun getRecentQueries(userId: String, limit: Int = 10): List<SearchQuery> {
        return withContext(Dispatchers.IO) {
            dao.getRecentQueries(userId, limit).map { it.toModel() }
        }
    }

    companion object {
        private const val DEFAULT_HISTORY_LIMIT = 50
        
        private fun generateId(): String {
            return java.util.UUID.randomUUID().toString()
        }
    }
}

data class SearchQuery(
    val id: String,
    val userId: String,
    val query: String,
    val queryType: QueryType,
    val searchedAt: Long
)

enum class QueryType {
    STORY,
    CHAPTER,
    ANNOTATION,
    SETTING
}

private fun SearchHistoryEntity.toModel(): SearchQuery {
    return SearchQuery(
        id = id,
        userId = userId,
        query = query,
        queryType = QueryType.valueOf(queryType),
        searchedAt = searchedAt
    )
}

