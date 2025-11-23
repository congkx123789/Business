package com.storysphere.storyreader.ui.community.platforminteractions.polls

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun PollList(
    polls: List<Poll>,
    onPollClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(polls) { poll ->
            PollCard(
                pollId = poll.id,
                question = poll.question,
                options = poll.options,
                totalVotes = poll.totalVotes,
                onVote = { /* Handle vote */ },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

data class Poll(
    val id: String,
    val question: String,
    val options: List<PollOption>,
    val totalVotes: Int
)

