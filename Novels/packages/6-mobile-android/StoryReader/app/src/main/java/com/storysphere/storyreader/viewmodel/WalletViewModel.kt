package com.storysphere.storyreader.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.storysphere.storyreader.model.Transaction
import com.storysphere.storyreader.model.Wallet
import com.storysphere.storyreader.network.GraphQLService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onStart
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WalletViewModel @Inject constructor(
    private val graphQLService: GraphQLService
) : ViewModel() {
    private val _balance = MutableStateFlow(0)
    val balance: StateFlow<Int> = _balance.asStateFlow()
    
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions: StateFlow<List<Transaction>> = _transactions.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()
    
    private var retryCount = 0
    private val maxRetries = 3
    private val retryDelayMs = 1000L
    
    fun loadWallet(userId: String, retry: Boolean = false) {
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            try {
                _isLoading.value = true
                if (!retry) {
                    _error.value = null
                }
                
                // Load from GraphQL
                val walletResult = graphQLService.getWalletBalance(userId)
                walletResult.fold(
                    onSuccess = { wallet ->
                        _balance.value = wallet.balance
                    },
                    onFailure = { throw it }
                )
                _isLoading.value = false
                retryCount = 0
            } catch (e: Exception) {
                if (retryCount < maxRetries) {
                    retryCount++
                    delay(retryDelayMs * retryCount) // Exponential backoff
                    loadWallet(userId, retry = true)
                } else {
                    _error.value = e.message ?: "Failed to load wallet after $maxRetries retries"
                    _isLoading.value = false
                    retryCount = 0
                }
            }
        }
    }
    
    fun loadTransactions(userId: String, retry: Boolean = false) {
        if (retry) {
            retryCount = 0
        }
        viewModelScope.launch {
            try {
                _isLoading.value = true
                if (!retry) {
                    _error.value = null
                }
                
                // Load from GraphQL
                val transactionsResult = graphQLService.getTransactionHistory(userId)
                transactionsResult.fold(
                    onSuccess = { transactions ->
                        _transactions.value = transactions
                    },
                    onFailure = { throw it }
                )
                _isLoading.value = false
                retryCount = 0
            } catch (e: Exception) {
                if (retryCount < maxRetries) {
                    retryCount++
                    delay(retryDelayMs * retryCount)
                    loadTransactions(userId, retry = true)
                } else {
                    _error.value = e.message ?: "Failed to load transactions after $maxRetries retries"
                    _isLoading.value = false
                    retryCount = 0
                }
            }
        }
    }
    
    fun topUp(userId: String, amount: Int) {
        viewModelScope.launch {
            // Optimistic update
            val oldBalance = _balance.value
            _balance.value = oldBalance + amount
            
            _isLoading.value = true
            _error.value = null
            
            try {
                // Implement top-up via GraphQL
                val result = graphQLService.topUpWallet(userId, amount)
                result.fold(
                    onSuccess = { wallet ->
                        _balance.value = wallet.balance
                        // Add transaction to list
                        val newTransaction = Transaction(
                            id = "tx_${System.currentTimeMillis()}",
                            userId = userId,
                            type = com.storysphere.storyreader.model.TransactionType.TOP_UP,
                            amount = amount,
                            balanceAfter = wallet.balance,
                            description = "Top-up",
                            createdAt = System.currentTimeMillis()
                        )
                        val currentTransactions = _transactions.value.toMutableList()
                        currentTransactions.add(0, newTransaction)
                        _transactions.value = currentTransactions
                        _isLoading.value = false
                    },
                    onFailure = { throw it }
                )
            } catch (e: Exception) {
                // Rollback optimistic update
                _balance.value = oldBalance
                _error.value = e.message ?: "Failed to top up wallet"
                _isLoading.value = false
            }
        }
    }
    
    fun retry() {
        // Get userId from current balance or use default
        val userId = "user1" // TODO: Get from auth state
        loadWallet(userId, retry = true)
        loadTransactions(userId, retry = true)
    }
    
    fun clearError() {
        _error.value = null
    }
}

