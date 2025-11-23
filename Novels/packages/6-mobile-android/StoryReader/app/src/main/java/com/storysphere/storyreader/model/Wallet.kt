package com.storysphere.storyreader.model

data class Wallet(
    val userId: String,
    val balance: Int = 0, // Points/Coins balance
    val currency: Currency = Currency.POINTS,
    val lastUpdatedAt: Long = System.currentTimeMillis()
)

enum class Currency {
    POINTS, // Virtual currency (1 point = 1/100 CNY)
    COINS   // Alternative currency name
}

data class Transaction(
    val id: String,
    val userId: String,
    val type: TransactionType,
    val amount: Int,
    val currency: Currency = Currency.POINTS,
    val description: String? = null,
    val relatedId: String? = null, // Story ID, Chapter ID, etc.
    val createdAt: Long = System.currentTimeMillis()
)

enum class TransactionType {
    TOP_UP,        // Top-up wallet
    PURCHASE,      // Purchase chapter
    REWARD,        // Reward from missions
    REFUND,        // Refund
    TRANSFER       // Transfer to/from
}

