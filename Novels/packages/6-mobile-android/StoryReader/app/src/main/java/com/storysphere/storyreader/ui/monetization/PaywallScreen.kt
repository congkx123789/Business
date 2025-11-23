package com.storysphere.storyreader.ui.monetization

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.PaywallViewModel

@Composable
fun PaywallScreen(
    viewModel: PaywallViewModel = hiltViewModel(),
    storyId: String,
    chapterId: String,
    onDismiss: () -> Unit = {}
) {
    val showPaywall by viewModel.showPaywall.collectAsState()
    val freeChaptersRemaining by viewModel.freeChaptersRemaining.collectAsState()
    val chapterPrice by viewModel.chapterPrice.collectAsState()
    val isPurchasing by viewModel.isPurchasing.collectAsState()

    if (showPaywall) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = { Text("Unlock Chapter") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Free chapters remaining: $freeChaptersRemaining")
                    Text("Price: ${chapterPrice ?: "--"} points")
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.purchaseChapter(chapterId) },
                    enabled = !isPurchasing
                ) {
                    Text("Purchase")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismiss) {
                    Text("Maybe Later")
                }
            }
        )
    } else {
        PaywallSummary(
            freeChaptersRemaining = freeChaptersRemaining,
            chapterPrice = chapterPrice,
            onUnlock = { viewModel.purchaseChapter(chapterId) }
        )
    }
}

@Composable
private fun PaywallSummary(
    freeChaptersRemaining: Int,
    chapterPrice: Int?,
    onUnlock: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(text = "Free chapters remaining: $freeChaptersRemaining")
        Text(text = "Chapter price: ${chapterPrice ?: "--"} points")
        Button(onClick = onUnlock) {
            Text("Unlock Chapter")
        }
    }
}

