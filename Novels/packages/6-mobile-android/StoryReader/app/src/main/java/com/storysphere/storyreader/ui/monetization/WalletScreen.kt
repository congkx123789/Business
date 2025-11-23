package com.storysphere.storyreader.ui.monetization

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.Currency
import com.storysphere.storyreader.model.Transaction
import com.storysphere.storyreader.ui.components.ErrorDisplay
import com.storysphere.storyreader.ui.components.EmptyState
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.WalletViewModel

@Composable
fun WalletScreen(
    viewModel: WalletViewModel = hiltViewModel(),
    userId: String,
    onBack: () -> Unit = {},
    onTopUp: () -> Unit = {}
) {
    val balance by viewModel.balance.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(userId) {
        viewModel.loadWallet(userId)
        viewModel.loadTransactions(userId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Wallet") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = onTopUp) {
                        Icon(Icons.Rounded.Add, contentDescription = "Top Up")
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> LoadingIndicator(modifier = Modifier.padding(padding))
            error != null -> ErrorDisplay(
                message = error ?: "Unknown error",
                onRetry = {
                    viewModel.loadWallet(userId)
                    viewModel.loadTransactions(userId)
                },
                modifier = Modifier.padding(padding)
            )
            else -> WalletContent(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                balance = balance,
                transactions = transactions,
                onTopUp = onTopUp
            )
        }
    }
}

@Composable
private fun WalletContent(
    modifier: Modifier = Modifier,
    balance: Int,
    transactions: List<Transaction>,
    onTopUp: () -> Unit
) {
    Column(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(text = "Balance")
                Text(text = "${balance} ${Currency.POINTS.name.lowercase()}")
                Button(onClick = onTopUp) {
                    Text("Top Up")
                }
            }
        }

        Text(text = "Transaction History")
        if (transactions.isEmpty()) {
            EmptyState(
                title = "No Transactions",
                message = "Your purchases and rewards will show up here."
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(transactions, key = { it.id }) { transaction ->
                    TransactionRow(transaction)
                }
            }
        }
    }
}

