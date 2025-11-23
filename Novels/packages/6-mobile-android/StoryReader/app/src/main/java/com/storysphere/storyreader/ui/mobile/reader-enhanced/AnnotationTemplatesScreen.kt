package com.storysphere.storyreader.ui.mobile.readerenhanced

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.storysphere.storyreader.viewmodel.AnnotationTemplatesViewModel

@Composable
fun AnnotationTemplatesScreen(
    userId: String,
    viewModel: AnnotationTemplatesViewModel = hiltViewModel(),
    onTemplateSelected: (String) -> Unit = {}
) {
    val templates by viewModel.templates.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("Annotation Templates") })
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { /* Create template */ }) {
                Text("+")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(templates) { template ->
                AnnotationTemplateCard(
                    template = template,
                    onClick = { onTemplateSelected(template.id) },
                    onDelete = { viewModel.deleteTemplate(template.id) }
                )
            }
        }
    }
}

@Composable
fun AnnotationTemplateCard(
    template: Any, // AnnotationTemplate model
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Template", // template.name
                    style = MaterialTheme.typography.titleMedium
                )
            }
            TextButton(onClick = onDelete) {
                Text("Delete")
            }
        }
    }
}

