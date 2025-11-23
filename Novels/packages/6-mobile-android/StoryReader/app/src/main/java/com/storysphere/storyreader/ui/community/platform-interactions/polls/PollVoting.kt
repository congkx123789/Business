package com.storysphere.storyreader.ui.community.platforminteractions.polls

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PollVoting(
    pollId: String,
    question: String,
    options: List<PollOption>,
    onVote: (String, String) -> Unit = {}, // pollId, optionId
    modifier: Modifier = Modifier
) {
    var selectedOption by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = question,
            style = MaterialTheme.typography.titleMedium
        )
        options.forEach { option ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .selectable(
                        selected = selectedOption == option.id,
                        onClick = { selectedOption = option.id }
                    )
                    .padding(16.dp)
            ) {
                RadioButton(
                    selected = selectedOption == option.id,
                    onClick = { selectedOption = option.id }
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(option.text)
            }
        }
        Button(
            onClick = {
                selectedOption?.let {
                    onVote(pollId, it)
                }
            },
            enabled = selectedOption != null,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Vote")
        }
    }
}

