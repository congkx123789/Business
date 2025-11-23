package com.storysphere.storyreader.ui.community.platforminteractions.quizzes

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun QuizLeaderboard(
    quizId: String,
    leaderboard: List<LeaderboardEntry>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Leaderboard",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(leaderboard) { entry ->
                    LeaderboardItem(entry = entry)
                }
            }
        }
    }
}

@Composable
fun LeaderboardItem(entry: LeaderboardEntry) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row {
            Text(
                text = "${entry.rank}.",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(entry.username)
                Text(
                    text = "Score: ${entry.score}%",
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
        Text(
            text = "${entry.timeTaken}s",
            style = MaterialTheme.typography.bodySmall
        )
    }
}

data class LeaderboardEntry(
    val rank: Int,
    val username: String,
    val score: Int,
    val timeTaken: Int
)

