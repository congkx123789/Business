package com.storysphere.storyreader.ui.community.platforminteractions.polls

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PollCard(
    pollId: String,
    question: String,
    options: List<PollOption>,
    totalVotes: Int,
    onVote: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = question,
                style = MaterialTheme.typography.titleMedium
            )
            options.forEach { option ->
                PollOptionItem(
                    option = option,
                    totalVotes = totalVotes,
                    onVote = { onVote(option.id) }
                )
            }
            Text(
                text = "$totalVotes votes",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PollOptionItem(
    option: PollOption,
    totalVotes: Int,
    onVote: () -> Unit
) {
    val percentage = if (totalVotes > 0) {
        (option.voteCount.toFloat() / totalVotes) * 100f
    } else {
        0f
    }

    Card(
        onClick = onVote,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(option.text)
                LinearProgressIndicator(
                    progress = percentage / 100f,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            Text("${percentage.toInt()}%")
        }
    }
}

data class PollOption(
    val id: String,
    val text: String,
    val voteCount: Int
)

