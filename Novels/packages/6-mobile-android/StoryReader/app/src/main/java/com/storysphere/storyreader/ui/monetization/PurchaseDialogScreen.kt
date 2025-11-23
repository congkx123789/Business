package com.storysphere.storyreader.ui.monetization

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable

@Composable
fun PurchaseDialog(
    chapterTitle: String,
    price: Int,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Purchase $chapterTitle") },
        text = { Text("Unlock this chapter for $price points?") },
        confirmButton = {
            Button(onClick = onConfirm) {
                Text("Purchase")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

