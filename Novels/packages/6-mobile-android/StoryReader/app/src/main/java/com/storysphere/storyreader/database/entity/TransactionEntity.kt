package com.storysphere.storyreader.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val type: TransactionType,
    val amount: Int,
    val currency: Currency = Currency.POINTS,
    val description: String? = null,
    val relatedId: String? = null, // Story ID, Chapter ID, etc.
    val createdAt: Long = System.currentTimeMillis()
)

enum class TransactionType {
    TOP_UP,
    PURCHASE,
    REWARD,
    REFUND,
    TRANSFER
}


