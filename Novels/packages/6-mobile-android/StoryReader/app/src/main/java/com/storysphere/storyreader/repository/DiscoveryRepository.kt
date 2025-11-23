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
class DiscoveryRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    fun getRankings(rankingType: RankingType, genre: String? = null, timeRange: String? = null): Flow<List<Story>> {
        return database.storyDao().getRankings(rankingType.name, genre, timeRange)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getRankings to GraphQLService
                    // graphQLService.getRankings(rankingType, genre, timeRange).fold(...)
                }
            }
    }
    
    fun getEditorPicks(limit: Int = 20, genre: String? = null): Flow<List<Story>> {
        return database.storyDao().getEditorPicks(limit, genre)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getEditorPicks to GraphQLService
                    // graphQLService.getEditorPicks(limit, genre).fold(...)
                }
            }
    }
    
    fun getGenreStories(genre: String, page: Int = 1, limit: Int = 20): Flow<List<Story>> {
        return database.storyDao().getStoriesByGenre(genre, limit, (page - 1) * limit)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getGenreStories to GraphQLService
                    // graphQLService.getGenreStories(genre, page, limit).fold(...)
                }
            }
    }
}

enum class RankingType {
    MONTHLY_VOTES,
    SALES,
    RECOMMENDATIONS,
    POPULARITY
}
