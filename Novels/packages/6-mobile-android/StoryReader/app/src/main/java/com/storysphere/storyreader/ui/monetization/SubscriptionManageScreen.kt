package com.storysphere.storyreader.ui.monetization

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.ui.components.EmptyState
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.SubscriptionViewModel

@Composable
fun SubscriptionManageScreen(
    viewModel: SubscriptionViewModel = hiltViewModel(),
    userId: String,
    onBack: () -> Unit = {}
) {
    val subscription by viewModel.subscription.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(userId) { viewModel.loadSubscription(userId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Manage Subscription") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> LoadingIndicator(modifier = Modifier.padding(padding))
            subscription == null -> EmptyState(
                title = "No Subscription",
                message = "Subscribe to unlock premium benefits.",
                modifier = Modifier.padding(padding)
            )
            else -> Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(text = "Plan: ${subscription!!.planName}")
                Text(text = "Status: ${subscription!!.status.name.lowercase()}")
                Text(text = "Renews automatically: ${subscription!!.autoRenew}")
                Button(onClick = { viewModel.cancelSubscription() }) {
                    Text("Cancel Subscription")
                }
            }
        }
    }
}

