package com.storysphere.storyreader.repository

import com.storysphere.storyreader.model.Vote
import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class VotesRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun voteForStory(storyId: String, votes: Int): Result<Unit> {
        return graphQLService.castMonthlyVote(storyId, votes)
    }
    
    suspend fun getVotesCount(storyId: String): Result<Int> {
        return graphQLService.getVotesCount(storyId)
    }
    
    suspend fun getVoteHistory(userId: String): Result<List<Vote>> {
        return graphQLService.getVoteHistory(userId)
    }
    
    suspend fun getAvailableVotes(userId: String): Result<Int> {
        return graphQLService.getAvailableVotes(userId)
    }
}


