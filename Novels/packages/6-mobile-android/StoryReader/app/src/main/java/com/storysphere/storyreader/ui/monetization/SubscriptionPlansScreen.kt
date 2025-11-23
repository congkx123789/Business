package com.storysphere.storyreader.ui.monetization

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.SubscriptionPlan
import com.storysphere.storyreader.ui.components.EmptyState
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.SubscriptionViewModel

@Composable
fun SubscriptionPlansScreen(
    viewModel: SubscriptionViewModel = hiltViewModel(),
    onBack: () -> Unit = {}
) {
    val plans by viewModel.plans.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadPlans() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Subscription Plans") },
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
            plans.isEmpty() -> EmptyState(
                title = "No Plans",
                message = "Plans will appear once available.",
                modifier = Modifier.padding(padding)
            )
            else -> PlanList(
                plans = plans,
                onSelectPlan = { viewModel.subscribe(it.id) },
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            )
        }
    }
}

@Composable
private fun PlanList(
    plans: List<SubscriptionPlan>,
    onSelectPlan: (SubscriptionPlan) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(plans, key = { it.id }) { plan ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(text = plan.name)
                    Text(text = "${plan.price} points / month")
                    plan.features.forEach { feature ->
                        Text(text = "• $feature")
                    }
                    Button(onClick = { onSelectPlan(plan) }) {
                        Text("Select Plan")
                    }
                }
            }
        }
    }
}

