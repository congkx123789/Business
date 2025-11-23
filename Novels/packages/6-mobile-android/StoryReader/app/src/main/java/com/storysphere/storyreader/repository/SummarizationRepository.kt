package com.storysphere.storyreader.repository

import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SummarizationRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun summarizeStory(storyId: String): Result<String> {
        return graphQLService.summarizeStory(storyId)
    }
    
    suspend fun summarizeChapter(chapterId: String): Result<String> {
        return graphQLService.summarizeChapter(chapterId)
    }
    
    suspend fun summarizeAnnotations(annotationIds: List<String>): Result<String> {
        return graphQLService.summarizeAnnotations(annotationIds)
    }
}


