package com.storysphere.storyreader.ui.community.platforminteractions.polls

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PollResults(
    pollId: String,
    question: String,
    options: List<PollOption>,
    totalVotes: Int,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = question,
                style = MaterialTheme.typography.titleMedium
            )
            options.forEach { option ->
                PollResultItem(
                    option = option,
                    totalVotes = totalVotes
                )
            }
            Text(
                text = "Total: $totalVotes votes",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun PollResultItem(
    option: PollOption,
    totalVotes: Int
) {
    val percentage = if (totalVotes > 0) {
        (option.voteCount.toFloat() / totalVotes) * 100f
    } else {
        0f
    }

    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(option.text)
            Text("${percentage.toInt()}% (${option.voteCount})")
        }
        LinearProgressIndicator(
            progress = percentage / 100f,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

