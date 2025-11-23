package com.storysphere.storyreader.utils.mobile.search

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SearchSuggestionsManager @Inject constructor(
    private val searchHistoryManager: SearchHistoryManager
) {
    fun getSuggestions(
        userId: String,
        currentInput: String,
        limit: Int = DEFAULT_SUGGESTION_LIMIT
    ): Flow<List<SearchSuggestion>> {
        return combine(
            searchHistoryManager.observeHistory(userId),
            // Could add other sources like popular queries, trending searches, etc.
        ) { history, _ ->
            generateSuggestions(currentInput, history, limit)
        }.flowOn(Dispatchers.Default)
    }

    private fun generateSuggestions(
        currentInput: String,
        history: List<SearchQuery>,
        limit: Int
    ): List<SearchSuggestion> {
        if (currentInput.isBlank()) {
            // Return recent searches
            return history.take(limit).map { query ->
                SearchSuggestion(
                    text = query.query,
                    type = SuggestionType.HISTORY,
                    queryType = query.queryType
                )
            }
        }

        val suggestions = mutableListOf<SearchSuggestion>()

        // 1. Exact matches from history (highest priority)
        history.filter { it.query.equals(currentInput, ignoreCase = true) }
            .take(5)
            .forEach { query ->
                suggestions.add(
                    SearchSuggestion(
                        text = query.query,
                        type = SuggestionType.HISTORY_EXACT,
                        queryType = query.queryType
                    )
                )
            }

        // 2. Starts with matches from history
        history.filter { it.query.startsWith(currentInput, ignoreCase = true) }
            .filter { !suggestions.any { s -> s.text == it.query } }
            .sortedByDescending { it.searchedAt }
            .take(limit - suggestions.size)
            .forEach { query ->
                suggestions.add(
                    SearchSuggestion(
                        text = query.query,
                        type = SuggestionType.HISTORY_PREFIX,
                        queryType = query.queryType
                    )
                )
            }

        // 3. Contains matches from history
        history.filter { it.query.contains(currentInput, ignoreCase = true) }
            .filter { !suggestions.any { s -> s.text == it.query } }
            .sortedByDescending { it.searchedAt }
            .take(limit - suggestions.size)
            .forEach { query ->
                suggestions.add(
                    SearchSuggestion(
                        text = query.query,
                        type = SuggestionType.HISTORY_CONTAINS,
                        queryType = query.queryType
                    )
                )
            }

        // 4. Popular queries (could be from a separate source)
        // For now, we'll use frequently searched queries
        val popularQueries = history
            .groupBy { it.query }
            .mapValues { it.value.size }
            .entries
            .sortedByDescending { it.value }
            .take(5)
            .map { it.key }

        popularQueries
            .filter { !suggestions.any { s -> s.text == it } }
            .take(limit - suggestions.size)
            .forEach { query ->
                suggestions.add(
                    SearchSuggestion(
                        text = query,
                        type = SuggestionType.POPULAR,
                        queryType = QueryType.STORY
                    )
                )
            }

        return suggestions.take(limit)
    }

    companion object {
        private const val DEFAULT_SUGGESTION_LIMIT = 10
    }
}

data class SearchSuggestion(
    val text: String,
    val type: SuggestionType,
    val queryType: QueryType
)

enum class SuggestionType {
    HISTORY,
    HISTORY_EXACT,
    HISTORY_PREFIX,
    HISTORY_CONTAINS,
    POPULAR
}

