package com.storysphere.storyreader.repository

import com.storysphere.storyreader.database.AppDatabase
import com.storysphere.storyreader.model.Transaction
import com.storysphere.storyreader.model.Wallet
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
class WalletRepository @Inject constructor(
    private val database: AppDatabase,
    private val graphQLService: GraphQLService
) {
    private val backgroundScope = CoroutineScope(SupervisorJob())
    
    fun getWallet(userId: String): Flow<Wallet?> {
        return database.walletDao().getWallet(userId)
            .map { entity -> entity?.toDomain() }
            .onStart {
                backgroundScope.launch {
                    graphQLService.getWalletBalance(userId).fold(
                        onSuccess = { wallet ->
                            database.walletDao().insertWallet(wallet.toEntity())
                        },
                        onFailure = { }
                    )
                }
            }
    }
    
    suspend fun topUpWallet(userId: String, amount: Int): Result<Wallet> {
        return graphQLService.topUpWallet(userId, amount).fold(
            onSuccess = { wallet ->
                database.walletDao().insertWallet(wallet.toEntity())
                Result.success(wallet)
            },
            onFailure = { error -> Result.failure(error) }
        )
    }
    
    fun getTransactionHistory(userId: String, limit: Int = 50): Flow<List<Transaction>> {
        return database.transactionDao().getTransactionHistory(userId, limit)
            .map { entities -> entities.map { it.toDomain() } }
            .onStart {
                backgroundScope.launch {
                    graphQLService.getTransactionHistory(userId, limit).fold(
                        onSuccess = { transactions ->
                            database.transactionDao().insertTransactions(transactions.map { it.toEntity() })
                        },
                        onFailure = { }
                    )
                }
            }
    }
}

// Extension functions for entity conversion
private fun com.storysphere.storyreader.database.entity.WalletEntity.toDomain(): Wallet {
    return Wallet(
        userId = this.userId,
        balance = this.balance,
        currency = com.storysphere.storyreader.model.Currency.valueOf(this.currency.name),
        lastUpdatedAt = this.lastUpdatedAt
    )
}

private fun Wallet.toEntity(): com.storysphere.storyreader.database.entity.WalletEntity {
    return com.storysphere.storyreader.database.entity.WalletEntity(
        userId = this.userId,
        balance = this.balance,
        currency = com.storysphere.storyreader.database.entity.Currency.valueOf(this.currency.name),
        lastUpdatedAt = this.lastUpdatedAt
    )
}

private fun com.storysphere.storyreader.database.entity.TransactionEntity.toDomain(): Transaction {
    return Transaction(
        id = this.id,
        userId = this.userId,
        type = com.storysphere.storyreader.model.TransactionType.valueOf(this.type.name),
        amount = this.amount,
        currency = com.storysphere.storyreader.model.Currency.valueOf(this.currency.name),
        description = this.description,
        relatedId = this.relatedId,
        createdAt = this.createdAt
    )
}

private fun Transaction.toEntity(): com.storysphere.storyreader.database.entity.TransactionEntity {
    return com.storysphere.storyreader.database.entity.TransactionEntity(
        id = this.id,
        userId = this.userId,
        type = com.storysphere.storyreader.database.entity.TransactionType.valueOf(this.type.name),
        amount = this.amount,
        currency = com.storysphere.storyreader.database.entity.Currency.valueOf(this.currency.name),
        description = this.description,
        relatedId = this.relatedId,
        createdAt = this.createdAt
    )
}
