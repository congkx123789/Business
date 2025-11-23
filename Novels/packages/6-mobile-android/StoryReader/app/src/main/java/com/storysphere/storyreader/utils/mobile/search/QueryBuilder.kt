package com.storysphere.storyreader.utils.mobile.search

import com.storysphere.storyreader.model.FilterQuery
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class QueryBuilder @Inject constructor() {
    fun buildSearchQuery(
        text: String? = null,
        filterQuery: FilterQuery? = null
    ): SearchQuery {
        return SearchQuery(
            text = text ?: "",
            tags = filterQuery?.tags,
            author = filterQuery?.author,
            genreId = filterQuery?.genreId,
            status = filterQuery?.status,
            completionStatus = filterQuery?.completionStatus,
            dateRange = filterQuery?.dateRange
        )
    }

    fun buildFilterQuery(
        tags: List<String>? = null,
        author: String? = null,
        genreId: Int? = null,
        status: String? = null,
        completionStatus: String? = null,
        dateRange: DateRange? = null
    ): FilterQuery {
        return FilterQuery(
            tags = tags,
            author = author,
            genreId = genreId,
            status = status,
            completionStatus = completionStatus,
            dateRange = dateRange
        )
    }

    fun combineQueries(queries: List<SearchQuery>): SearchQuery {
        return SearchQuery(
            text = queries.firstOrNull()?.text ?: "",
            tags = queries.flatMap { it.tags ?: emptyList() }.distinct(),
            author = queries.firstOrNull { it.author != null }?.author,
            genreId = queries.firstOrNull { it.genreId != null }?.genreId,
            status = queries.firstOrNull { it.status != null }?.status,
            completionStatus = queries.firstOrNull { it.completionStatus != null }?.completionStatus,
            dateRange = queries.firstOrNull { it.dateRange != null }?.dateRange
        )
    }
}

data class SearchQuery(
    val text: String,
    val tags: List<String>? = null,
    val author: String? = null,
    val genreId: Int? = null,
    val status: String? = null,
    val completionStatus: String? = null,
    val dateRange: DateRange? = null
)

data class DateRange(
    val start: String?,
    val end: String?
)

