package com.storysphere.storyreader.repository

import com.storysphere.storyreader.model.Tip
import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TippingRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun tipAuthor(storyId: String, authorId: String, amount: Int, message: String? = null): Result<Tip> {
        return graphQLService.createTip(storyId, amount, message)
            .map { tipId ->
                Tip(
                    id = tipId,
                    userId = "", // TODO: Get from auth
                    storyId = storyId,
                    authorId = authorId,
                    amount = amount,
                    message = message
                )
            }
    }
    
    suspend fun getTippingHistory(userId: String): Result<List<Tip>> {
        return graphQLService.getTippingHistory(userId)
    }
    
    suspend fun getAuthorTippingStats(authorId: String): Result<AuthorTippingStats> {
        return graphQLService.getAuthorTippingStats(authorId)
    }
}

data class AuthorTippingStats(
    val authorId: String,
    val totalTips: Int,
    val tipCount: Int,
    val topSupporters: List<TipSupporter>
)

data class TipSupporter(
    val userId: String,
    val username: String,
    val avatar: String? = null,
    val totalAmount: Int,
    val tipCount: Int
)


