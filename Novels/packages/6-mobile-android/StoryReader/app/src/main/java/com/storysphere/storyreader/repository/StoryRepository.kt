package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.database.entity.StoryEntity
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StoryRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    // Offline-First: Load from Room first, then fetch from network
    fun getStory(id: String): Flow<Story?> = flow {
        // 1. Load from Room first (instant)
        val localStory = database.storyDao().getStory(id)
        localStory?.let { emit(it.toModel()) }
        
        // 2. Fetch from network in background (always refresh)
        graphQLService.getStory(id).fold(
            onSuccess = { remoteStory ->
                // 3. Update Room with fresh data
                database.storyDao().insertStory(remoteStory.toEntity())
                emit(remoteStory)
            },
            onFailure = { 
                // If network fails and we have local data, keep showing it
                // Error already logged in GraphQLService
            }
        )
    }
    
    fun getStories(limit: Int = 20, offset: Int = 0): Flow<List<Story>> = flow {
        // 1. Load from Room first (instant)
        val localStories = database.storyDao().getStories(limit, offset)
        emit(localStories.map { it.toModel() })
        
        // 2. Fetch from network in background
        graphQLService.getStories(limit, offset).fold(
            onSuccess = { remoteStories ->
                // 3. Update Room with fresh data
                remoteStories.forEach { story ->
                    database.storyDao().insertStory(story.toEntity())
                }
                // Emit updated list
                val updatedStories = database.storyDao().getStories(limit, offset)
                emit(updatedStories.map { it.toModel() })
            },
            onFailure = { /* Error already logged in GraphQLService */ }
        )
    }
}

// Extension functions for Entity <-> Model conversion
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

private fun Story.toEntity(): StoryEntity {
    return StoryEntity(
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

