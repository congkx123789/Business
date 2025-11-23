package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.StoryEntity
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.network.GraphQLService
import com.storysphere.storyreader.utils.mobile.search.SearchQuery
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SearchRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    // Offline-First: Search in local database first, then network
    fun searchStories(searchQuery: SearchQuery): Flow<List<Story>> = flow {
        // 1. Search in Room first (instant results)
        val localStories = database.storyDao().searchStories(searchQuery.text)
        emit(localStories.map { it.toModel() })
        
        // 2. Search on network in background
        // TODO: Implement GraphQL search query when backend is ready
        // For now, return local results
    }
    
    suspend fun searchStoriesSync(searchQuery: SearchQuery): List<Story> {
        // Synchronous search for immediate results
        val localStories = database.storyDao().searchStories(searchQuery.text)
        return localStories.map { it.toModel() }
    }
}

// Extension function for Entity -> Model conversion
private fun StoryEntity.toModel(): Story {
    return Story(
        id = id,
        title = title,
        author = author,
        description = description,
        coverImage = coverImage,
        genreId = genreId,
        genre = genre,
        status = status,
        totalChapters = totalChapters,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

