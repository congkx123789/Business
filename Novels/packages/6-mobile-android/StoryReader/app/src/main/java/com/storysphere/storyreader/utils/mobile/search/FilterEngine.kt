package com.storysphere.storyreader.utils.mobile.search

import com.storysphere.storyreader.model.FilterQuery
import com.storysphere.storyreader.model.Story
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FilterEngine @Inject constructor() {
    fun filterStories(
        stories: List<Story>,
        filterQuery: FilterQuery
    ): List<Story> {
        return stories.filter { story ->
            matchesFilter(story, filterQuery)
        }
    }

    private fun matchesFilter(story: Story, filterQuery: FilterQuery): Boolean {
        // Check tags
        filterQuery.tags?.let { tags ->
            // Assuming story has tags field - adjust based on actual model
            // if (story.tags?.none { tags.contains(it) } == true) return false
        }

        // Check author
        filterQuery.author?.let { author ->
            if (!story.author.contains(author, ignoreCase = true)) return false
        }

        // Check genre
        filterQuery.genreId?.let { genreId ->
            if (story.genreId != genreId) return false
        }

        // Check status
        filterQuery.status?.let { status ->
            if (story.status != status) return false
        }

        // Check date range
        filterQuery.dateRange?.let { dateRange ->
            story.createdAt?.let { createdAt ->
                if (dateRange.start != null && createdAt < dateRange.start) return false
                if (dateRange.end != null && createdAt > dateRange.end) return false
            }
        }

        return true
    }

    fun buildFilterDescription(filterQuery: FilterQuery): String {
        val parts = mutableListOf<String>()
        
        filterQuery.tags?.takeIf { it.isNotEmpty() }?.let {
            parts.add("Tags: ${it.joinToString(", ")}")
        }
        
        filterQuery.author?.let {
            parts.add("Author: $it")
        }
        
        filterQuery.genreId?.let {
            parts.add("Genre ID: $it")
        }
        
        filterQuery.status?.let {
            parts.add("Status: $it")
        }
        
        filterQuery.completionStatus?.let {
            parts.add("Completion: $it")
        }
        
        filterQuery.dateRange?.let {
            val range = buildString {
                if (it.start != null) append(it.start)
                append(" - ")
                if (it.end != null) append(it.end)
            }
            parts.add("Date: $range")
        }
        
        return parts.joinToString(" • ") ?: "No filters"
    }
}

