package com.storysphere.storyreader.ui.community.forums

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ForumThread

@Composable
fun ForumSection(
    threads: List<ForumThread>,
    onReply: (ForumThread, String) -> Unit,
    onCreateThread: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    var replyTarget by remember { mutableStateOf<ForumThread?>(null) }
    var replyText by remember { mutableStateOf("") }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 24.dp)
    ) {
        Text(
            text = "Forums",
            style = MaterialTheme.typography.titleMedium
        )
        if (threads.isEmpty()) {
            Text(
                text = "No threads yet. Start a new discussion!",
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(threads, key = { it.id }) { thread ->
                    ForumThreadCard(
                        thread = thread,
                        onReply = { selected ->
                            replyTarget = selected
                            replyText = ""
                        }
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(12.dp))
        ForumThreadForm(onSubmit = onCreateThread)
    }

    replyTarget?.let { thread ->
        AlertDialog(
            onDismissRequest = { replyTarget = null },
            title = { Text("Reply to ${thread.title}") },
            text = {
                TextField(
                    value = replyText,
                    onValueChange = { replyText = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Enter reply") }
                )
            },
            confirmButton = {
                Button(onClick = {
                    if (replyText.isNotBlank()) {
                        onReply(thread, replyText.trim())
                        replyTarget = null
                    }
                }) {
                    Text("Send")
                }
            },
            dismissButton = {
                TextButton(onClick = { replyTarget = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

