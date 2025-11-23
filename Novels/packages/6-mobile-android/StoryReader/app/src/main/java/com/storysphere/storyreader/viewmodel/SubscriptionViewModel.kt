package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Subscription
import com.storysphere.storyreader.model.SubscriptionPlan
import com.storysphere.storyreader.network.GraphQLService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SubscriptionViewModel @Inject constructor(
    private val graphQLService: GraphQLService
) : ViewModel() {
    
    private val _subscription = MutableStateFlow<Subscription?>(null)
    val subscription: StateFlow<Subscription?> = _subscription.asStateFlow()
    
    private val _plans = MutableStateFlow<List<SubscriptionPlan>>(emptyList())
    val plans: StateFlow<List<SubscriptionPlan>> = _plans.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private var retryCount = 0
    private val maxRetries = 3
    private val retryDelayMs = 1000L
    
    fun loadSubscription(userId: String, retry: Boolean = false) {
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            try {
                _isLoading.value = true
                if (!retry) {
                    _error.value = null
                }
                
                val result = graphQLService.getMembership(userId)
                result.fold(
                    onSuccess = { membership ->
                        _subscription.value = membership?.let {
                            Subscription(
                                id = it.id,
                                userId = userId,
                                planId = it.planId,
                                status = it.status,
                                startDate = it.startDate,
                                endDate = it.endDate,
                                autoRenew = it.autoRenew
                            )
                        }
                        _isLoading.value = false
                        retryCount = 0
                    },
                    onFailure = { error ->
                        if (retryCount < maxRetries) {
                            retryCount++
                            delay(retryDelayMs * retryCount)
                            loadSubscription(userId, retry = true)
                        } else {
                            _error.value = error.message ?: "Failed to load subscription after $maxRetries retries"
                            _isLoading.value = false
                            retryCount = 0
                        }
                    }
                )
            } catch (e: Exception) {
                if (retryCount < maxRetries) {
                    retryCount++
                    delay(retryDelayMs * retryCount)
                    loadSubscription(userId, retry = true)
                } else {
                    _error.value = e.message ?: "Failed to load subscription after $maxRetries retries"
                    _isLoading.value = false
                    retryCount = 0
                }
            }
        }
    }
    
    fun loadPlans(retry: Boolean = false) {
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            try {
                _isLoading.value = true
                if (!retry) {
                    _error.value = null
                }
                
                // TODO: Implement repository method to fetch plans
                // For now, use placeholder
                _plans.value = emptyList()
                _isLoading.value = false
                retryCount = 0
            } catch (e: Exception) {
                if (retryCount < maxRetries) {
                    retryCount++
                    delay(retryDelayMs * retryCount)
                    loadPlans(retry = true)
                } else {
                    _error.value = e.message ?: "Failed to load plans after $maxRetries retries"
                    _isLoading.value = false
                    retryCount = 0
                }
            }
        }
    }
    
    fun subscribe(userId: String, planId: String) {
        viewModelScope.launch {
            // Optimistic update
            val oldSubscription = _subscription.value
            val optimisticSubscription = Subscription(
                id = "temp_${System.currentTimeMillis()}",
                userId = userId,
                planId = planId,
                status = com.storysphere.storyreader.model.SubscriptionStatus.ACTIVE,
                startDate = System.currentTimeMillis(),
                endDate = System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000), // 30 days
                autoRenew = true
            )
            _subscription.value = optimisticSubscription
            
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = graphQLService.createMembership(userId, planId)
                result.fold(
                    onSuccess = { membership ->
                        _subscription.value = Subscription(
                            id = membership.id,
                            userId = userId,
                            planId = membership.planId,
                            status = membership.status,
                            startDate = membership.startDate,
                            endDate = membership.endDate,
                            autoRenew = membership.autoRenew
                        )
                        _isLoading.value = false
                    },
                    onFailure = { error ->
                        // Rollback optimistic update
                        _subscription.value = oldSubscription
                        _error.value = error.message ?: "Failed to subscribe"
                        _isLoading.value = false
                    }
                )
            } catch (e: Exception) {
                // Rollback optimistic update
                _subscription.value = oldSubscription
                _error.value = e.message ?: "Failed to subscribe"
                _isLoading.value = false
            }
        }
    }
    
    fun cancelSubscription(userId: String) {
        viewModelScope.launch {
            // Optimistic update
            val oldSubscription = _subscription.value
            oldSubscription?.let {
                _subscription.value = it.copy(
                    status = com.storysphere.storyreader.model.SubscriptionStatus.CANCELLED,
                    autoRenew = false
                )
            }
            
            _isLoading.value = true
            _error.value = null
            
            try {
                val result = graphQLService.cancelMembership(userId)
                result.fold(
                    onSuccess = { membership ->
                        _subscription.value = membership?.let {
                            Subscription(
                                id = it.id,
                                userId = userId,
                                planId = it.planId,
                                status = it.status,
                                startDate = it.startDate,
                                endDate = it.endDate,
                                autoRenew = it.autoRenew
                            )
                        }
                        _isLoading.value = false
                    },
                    onFailure = { error ->
                        // Rollback optimistic update
                        _subscription.value = oldSubscription
                        _error.value = error.message ?: "Failed to cancel subscription"
                        _isLoading.value = false
                    }
                )
            } catch (e: Exception) {
                // Rollback optimistic update
                _subscription.value = oldSubscription
                _error.value = e.message ?: "Failed to cancel subscription"
                _isLoading.value = false
            }
        }
    }
    
    fun retry() {
        _subscription.value?.userId?.let { userId ->
            loadSubscription(userId, retry = true)
        }
        loadPlans(retry = true)
    }
    
    fun clearError() {
        _error.value = null
    }
}

