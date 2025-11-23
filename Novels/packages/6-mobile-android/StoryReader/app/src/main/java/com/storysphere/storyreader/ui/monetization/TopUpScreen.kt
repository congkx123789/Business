package com.storysphere.storyreader.ui.monetization

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.WalletViewModel

@Composable
fun TopUpScreen(
    viewModel: WalletViewModel = hiltViewModel(),
    userId: String,
    onBack: () -> Unit = {}
) {
    var amount by remember { mutableIntStateOf(100) }
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Top Up Wallet") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(text = "Amount (${amount} points)")
            Slider(
                value = amount.toFloat(),
                onValueChange = { amount = it.toInt().coerceIn(50, 10000) },
                valueRange = 50f..10000f
            )
            OutlinedTextField(
                value = amount.toString(),
                onValueChange = { value ->
                    value.toIntOrNull()?.let { amount = it.coerceIn(50, 10000) }
                },
                label = { Text("Points") },
                modifier = Modifier.fillMaxWidth()
            )
            Button(
                modifier = Modifier.fillMaxWidth(),
                onClick = { viewModel.topUp(userId, amount) }
            ) {
                Text(text = "Confirm Top Up")
            }
        }
    }
}

