package com.storysphere.storyreader.viewmodel

import com.storysphere.storyreader.model.Transaction
import com.storysphere.storyreader.model.TransactionType
import com.storysphere.storyreader.model.Wallet
import com.storysphere.storyreader.network.GraphQLService
import io.mockk.*
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*
import kotlinx.coroutines.delay

class WalletViewModelTest {
    
    private lateinit var graphQLService: GraphQLService
    private lateinit var viewModel: WalletViewModel
    
    @Before
    fun setup() {
        graphQLService = mockk()
        viewModel = WalletViewModel(graphQLService)
    }
    
    @Test
    fun `loadWallet should update balance when successful`() = runTest {
        // Given
        val userId = "user1"
        val expectedWallet = Wallet(
            userId = userId,
            balance = 5000,
            currency = "Points",
            lastUpdated = System.currentTimeMillis()
        )
        
        every { graphQLService.getWalletBalance(userId) } returns Result.success(expectedWallet)
        
        // When
        viewModel.loadWallet(userId)
        delay(100)
        
        // Then
        assertEquals(expectedWallet.balance, viewModel.balance.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
        
        verify { graphQLService.getWalletBalance(userId) }
    }
    
    @Test
    fun `loadWallet should set error when service fails`() = runTest {
        // Given
        val userId = "user1"
        val errorMessage = "Network error"
        val exception = Exception(errorMessage)
        
        every { graphQLService.getWalletBalance(userId) } returns Result.failure(exception)
        
        // When
        viewModel.loadWallet(userId)
        delay(500)
        
        // Then
        assertNotNull(viewModel.error.value)
        assertFalse(viewModel.isLoading.value)
        
        verify { graphQLService.getWalletBalance(userId) }
    }
    
    @Test
    fun `loadTransactions should update transactions when successful`() = runTest {
        // Given
        val userId = "user1"
        val expectedTransactions = listOf(
            Transaction(
                id = "tx1",
                userId = userId,
                type = TransactionType.TOP_UP,
                amount = 1000,
                balanceAfter = 5000,
                description = "Top-up",
                createdAt = System.currentTimeMillis()
            )
        )
        
        every { graphQLService.getTransactionHistory(userId) } returns Result.success(expectedTransactions)
        
        // When
        viewModel.loadTransactions(userId)
        delay(100)
        
        // Then
        assertEquals(expectedTransactions, viewModel.transactions.value)
        assertFalse(viewModel.isLoading.value)
        assertNull(viewModel.error.value)
        
        verify { graphQLService.getTransactionHistory(userId) }
    }
    
    @Test
    fun `topUp should perform optimistic update`() = runTest {
        // Given
        val userId = "user1"
        val amount = 1000
        val initialBalance = 5000
        val newBalance = initialBalance + amount
        
        val initialWallet = Wallet(
            userId = userId,
            balance = initialBalance,
            currency = "Points",
            lastUpdated = System.currentTimeMillis()
        )
        
        val updatedWallet = Wallet(
            userId = userId,
            balance = newBalance,
            currency = "Points",
            lastUpdated = System.currentTimeMillis()
        )
        
        every { graphQLService.getWalletBalance(userId) } returns Result.success(initialWallet)
        every { graphQLService.topUpWallet(userId, amount) } returns Result.success(updatedWallet)
        
        // When
        viewModel.loadWallet(userId)
        delay(100)
        
        val oldBalance = viewModel.balance.value
        viewModel.topUp(userId, amount)
        delay(100)
        
        // Then
        // Optimistic update should increase balance immediately
        assertTrue(viewModel.balance.value >= oldBalance)
        verify { graphQLService.topUpWallet(userId, amount) }
    }
    
    @Test
    fun `topUp should rollback on failure`() = runTest {
        // Given
        val userId = "user1"
        val amount = 1000
        val initialBalance = 5000
        
        val initialWallet = Wallet(
            userId = userId,
            balance = initialBalance,
            currency = "Points",
            lastUpdated = System.currentTimeMillis()
        )
        
        every { graphQLService.getWalletBalance(userId) } returns Result.success(initialWallet)
        every { graphQLService.topUpWallet(userId, amount) } returns Result.failure(Exception("Payment failed"))
        
        // When
        viewModel.loadWallet(userId)
        delay(100)
        
        val oldBalance = viewModel.balance.value
        viewModel.topUp(userId, amount)
        delay(100)
        
        // Then
        // Should rollback to original balance
        assertEquals(oldBalance, viewModel.balance.value)
        assertNotNull(viewModel.error.value)
        
        verify { graphQLService.topUpWallet(userId, amount) }
    }
    
    @Test
    fun `retry should reload wallet and transactions`() = runTest {
        // Given
        val userId = "user1"
        val wallet = Wallet(
            userId = userId,
            balance = 5000,
            currency = "Points",
            lastUpdated = System.currentTimeMillis()
        )
        val transactions = emptyList<Transaction>()
        
        every { graphQLService.getWalletBalance(userId) } returns Result.success(wallet)
        every { graphQLService.getTransactionHistory(userId) } returns Result.success(transactions)
        
        // When
        viewModel.retry()
        delay(100)
        
        // Then
        assertEquals(wallet.balance, viewModel.balance.value)
        verify { graphQLService.getWalletBalance(userId) }
        verify { graphQLService.getTransactionHistory(userId) }
    }
    
    @Test
    fun `clearError should reset error state`() = runTest {
        // Given
        val userId = "user1"
        every { graphQLService.getWalletBalance(userId) } returns Result.failure(Exception("Test error"))
        
        viewModel.loadWallet(userId)
        delay(500)
        
        // When
        viewModel.clearError()
        
        // Then
        assertNull(viewModel.error.value)
    }
}

