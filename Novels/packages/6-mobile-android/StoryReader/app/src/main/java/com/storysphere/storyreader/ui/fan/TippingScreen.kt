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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.ui.components.LoadingIndicator
import com.storysphere.storyreader.viewmodel.TippingViewModel

@Composable
fun TippingScreen(
    viewModel: TippingViewModel = hiltViewModel(),
    storyId: String,
    authorId: String,
    onBack: () -> Unit = {}
) {
    val isLoading by viewModel.isLoading.collectAsState()
    var amount by remember { mutableIntStateOf(100) }
    var message by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Support Author") },
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
                Text(text = "Choose an amount (points)")
                OutlinedTextField(
                    value = amount.toString(),
                    onValueChange = { value ->
                        value.toIntOrNull()?.let { amount = it.coerceAtLeast(10) }
                    },
                    label = { Text("Amount") }
                )
                OutlinedTextField(
                    value = message,
                    onValueChange = { message = it },
                    label = { Text("Message (optional)") }
                )
                Button(
                    onClick = {
                        viewModel.submitTip(
                            storyId = storyId,
                            authorId = authorId,
                            amount = amount,
                            message = message.ifBlank { null }
                        )
                    }
                ) {
                    Text("Send Tip")
                }
            }
        }
    }
}

