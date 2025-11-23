package com.storysphere.storyreader.repository

import com.storysphere.storyreader.model.Subscription
import com.storysphere.storyreader.model.SubscriptionPlan
import com.storysphere.storyreader.network.GraphQLService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SubscriptionRepository @Inject constructor(
    private val graphQLService: GraphQLService
) {
    suspend fun getSubscription(userId: String): Result<Subscription?> {
        return graphQLService.getSubscription(userId)
    }
    
    suspend fun getSubscriptionPlans(): Result<List<SubscriptionPlan>> {
        return graphQLService.getSubscriptionPlans()
    }
    
    suspend fun subscribe(userId: String, planId: String): Result<Subscription> {
        return graphQLService.subscribe(userId, planId)
    }
    
    suspend fun cancelSubscription(userId: String): Result<Unit> {
        return graphQLService.cancelSubscription(userId)
    }
}


