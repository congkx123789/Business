package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.Chapter
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
class PaywallRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    data class PaywallInfo(
        val showPaywall: Boolean,
        val freeChaptersRemaining: Int,
        val chapterPrice: Int?,
        val isUnlocked: Boolean
    )
    
    fun getPaywallInfo(storyId: String, chapterId: String): Flow<PaywallInfo> {
        return database.chapterDao().getChapterFlow(chapterId)
            .map { entity ->
                PaywallInfo(
                    showPaywall = entity?.isPaid == true && entity.isUnlocked == false,
                    freeChaptersRemaining = 0, // TODO: Calculate from story metadata
                    chapterPrice = entity?.price,
                    isUnlocked = entity?.isUnlocked == true
                )
            }
            .onStart {
                backgroundScope.launch {
                    // Refresh chapter metadata from network
                    graphQLService.getChapter(chapterId).fold(
                        onSuccess = { chapter ->
                            database.chapterDao().insertChapter(chapter.toEntity())
                        },
                        onFailure = { }
                    )
                }
            }
    }
    
    suspend fun purchaseChapter(chapterId: String): Result<Chapter> {
        return graphQLService.purchaseChapter(chapterId).fold(
            onSuccess = { chapter ->
                database.chapterDao().insertChapter(chapter.toEntity())
                Result.success(chapter)
            },
            onFailure = { error -> Result.failure(error) }
        )
    }
    
    suspend fun purchaseBulk(chapterIds: List<String>): Result<List<Chapter>> {
        return graphQLService.purchaseBulk(chapterIds).fold(
            onSuccess = { chapters ->
                database.chapterDao().insertChapters(chapters.map { it.toEntity() })
                Result.success(chapters)
            },
            onFailure = { error -> Result.failure(error) }
        )
    }
    
    fun getPurchaseHistory(userId: String): Flow<List<Chapter>> {
        return database.chapterDao().getPurchasedChapters(userId)
            .map { entities -> entities.map { it.toDomain(null) } }
            .onStart {
                backgroundScope.launch {
                    graphQLService.getPurchaseHistory(userId).fold(
                        onSuccess = { chapters ->
                            database.chapterDao().insertChapters(chapters.map { it.toEntity() })
                        },
                        onFailure = { }
                    )
                }
            }
    }
}
