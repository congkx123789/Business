package com.storysphere.storyreader.ui.fan

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.FanRankingsViewModel

@Composable
fun AuthorSupportScreen(
    viewModel: FanRankingsViewModel = hiltViewModel(),
    authorId: String,
    onBack: () -> Unit = {}
) {
    val rankings by viewModel.rankings.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Author Support") },
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
            Text(text = "Top supporters")
            rankings.take(3).forEachIndexed { index, supporter ->
                Text(text = "#${index + 1} ${supporter.username} • ${supporter.totalAmount} points")
            }
            Button(
                modifier = Modifier.fillMaxWidth(),
                onClick = { viewModel.loadRankings(authorId = authorId) }
            ) {
                Text("Refresh Stats")
            }
        }
    }
}

