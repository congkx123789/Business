package com.storysphere.storyreader.ui.fan

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.model.VoteType
import com.storysphere.storyreader.viewmodel.VotesViewModel

@Composable
fun VotesScreen(
    viewModel: VotesViewModel = hiltViewModel(),
    storyId: String,
    onBack: () -> Unit = {}
) {
    val availableVotes by viewModel.availableVotes.collectAsState()
    val voteStats by viewModel.voteStats.collectAsState()
    var votesToCast by remember { mutableIntStateOf(1) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cast Votes") },
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
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(text = "Available votes: $availableVotes")
            voteStats?.let {
                Text(text = "Total votes this month: ${it.totalVotes}")
            }
            OutlinedTextField(
                value = votesToCast.toString(),
                onValueChange = { value ->
                    value.toIntOrNull()?.let { votesToCast = it.coerceAtLeast(1) }
                },
                label = { Text("Votes to cast") }
            )
            Button(onClick = { viewModel.castVote(storyId, votesToCast, VoteType.MONTHLY_VOTE) }) {
                Text("Submit Votes")
            }
        }
    }
}

