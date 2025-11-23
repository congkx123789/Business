package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.Post
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
class FeedRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    // Offline-First: Load from Room first, then fetch from network
    fun getFeed(userId: String, limit: Int = 20): Flow<List<Post>> {
        return database.postDao().getFeed(userId, limit)
            .map { entities -> entities.map { it.toModel() } }
            .onStart {
                backgroundScope.launch {
                    // TODO: Add getFeed to GraphQLService when available
                    // graphQLService.getFeed(userId, limit).fold(
                    //     onSuccess = { remotePosts ->
                    //         database.postDao().insertPosts(remotePosts.map { it.toEntity() })
                    //     },
                    //     onFailure = { }
                    // )
                }
            }
    }
    
    suspend fun createPost(userId: String, content: String, storyId: String? = null): Result<Post> {
        // TODO: Implement createPost via GraphQLService when available
        return Result.failure(Exception("Not implemented yet"))
    }
}

private fun com.storysphere.storyreader.database.entity.PostEntity.toModel() = Post(
    id = id,
    userId = userId,
    content = content,
    images = images,
    likes = likes,
    comments = comments,
    shares = shares,
    createdAt = createdAt,
    updatedAt = updatedAt
)

private fun Post.toEntity() = com.storysphere.storyreader.database.entity.PostEntity(
    id = id,
    userId = userId,
    content = content,
    images = images,
    storyId = null,
    likes = likes,
    comments = comments,
    shares = shares,
    createdAt = createdAt,
    updatedAt = updatedAt
)
