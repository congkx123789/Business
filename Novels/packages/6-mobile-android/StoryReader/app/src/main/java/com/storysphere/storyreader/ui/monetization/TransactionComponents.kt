package com.storysphere.storyreader.ui.monetization

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.Transaction
import com.storysphere.storyreader.model.TransactionType
import com.storysphere.storyreader.utils.DateUtils

@Composable
fun TransactionRow(transaction: Transaction) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = transaction.description ?: getTransactionTypeLabel(transaction.type))
            Text(
                text = DateUtils.formatRelativeTime(transaction.createdAt),
                modifier = Modifier.padding(top = 4.dp)
            )
            Text(
                text = formatAmount(transaction),
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

private fun formatAmount(transaction: Transaction): String {
    val prefix = when (transaction.type) {
        TransactionType.TOP_UP, TransactionType.REWARD -> "+"
        else -> "-"
    }
    return "$prefix${transaction.amount} ${transaction.currency.name.lowercase()}"
}

private fun getTransactionTypeLabel(type: TransactionType): String = when (type) {
    TransactionType.TOP_UP -> "Top Up"
    TransactionType.PURCHASE -> "Purchase"
    TransactionType.REWARD -> "Reward"
    TransactionType.REFUND -> "Refund"
    TransactionType.TRANSFER -> "Transfer"
}

