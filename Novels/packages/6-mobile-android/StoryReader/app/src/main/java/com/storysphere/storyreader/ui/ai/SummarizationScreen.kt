package com.storysphere.storyreader.ui.ai

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
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.SummarizationViewModel

@Composable
fun SummarizationScreen(
    viewModel: SummarizationViewModel = hiltViewModel(),
    onBack: () -> Unit = {}
) {
    val summary by viewModel.summary.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    var storyId by remember { mutableStateOf("") }
    var chapterId by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("AI Summary") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        if (isLoading) {
            LoadingIndicator(modifier = Modifier.padding(padding))
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = storyId,
                    onValueChange = { storyId = it },
                    label = { Text("Story ID") }
                )
                OutlinedTextField(
                    value = chapterId,
                    onValueChange = { chapterId = it },
                    label = { Text("Chapter ID (optional)") }
                )
                Button(onClick = {
                    viewModel.generateSummary(
                        storyId = storyId.takeIf { it.isNotBlank() },
                        chapterId = chapterId.takeIf { it.isNotBlank() }
                    )
                }) {
                    Text("Generate Summary")
                }
                summary?.let {
                    Text(text = it)
                }
            }
        }
    }
}

