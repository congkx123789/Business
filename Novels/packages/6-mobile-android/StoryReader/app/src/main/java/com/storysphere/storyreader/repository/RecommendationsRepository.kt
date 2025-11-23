package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.Story
import com.storysphere.storyreader.network.GraphQLService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RecommendationsRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    fun getRecommendations(userId: String, limit: Int = 20): Flow<List<Story>> {
        return database.storyDao().getRecommendations(userId, limit)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getRecommendations to GraphQLService
                    // graphQLService.getRecommendations(userId, limit).fold(...)
                }
            }
    }
    
    fun getSimilarStories(storyId: String, limit: Int = 10): Flow<List<Story>> {
        return database.storyDao().getSimilarStories(storyId, limit)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getSimilarStories to GraphQLService
                    // graphQLService.getSimilarStories(storyId, limit).fold(...)
                }
            }
    }
    
    fun getTrending(limit: Int = 20): Flow<List<Story>> {
        return database.storyDao().getTrending(limit)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getTrending to GraphQLService
                    // graphQLService.getTrending(limit).fold(...)
                }
            }
    }
}
