package com.storysphere.storyreader.repository

import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TranslationRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun translateText(text: String, sourceLang: String, targetLang: String): Result<String> {
        return graphQLService.translateText(text, sourceLang, targetLang)
    }
    
    suspend fun translateChapter(chapterId: String, targetLang: String): Result<String> {
        return graphQLService.translateChapter(chapterId, targetLang)
    }
}


