package com.storysphere.storyreader.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AnnotationDialog(
    selectedText: String,
    onDismiss: () -> Unit,
    onConfirm: (String?, String?, List<String>) -> Unit,
    initialNote: String? = null,
    initialColor: String? = null
) {
    var note by remember { mutableStateOf(initialNote ?: "") }
    var color by remember { mutableStateOf(initialColor ?: "#FFEB3B") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Annotation") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "\"$selectedText\"",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Note") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 5
                )
                
                // Color picker (simplified - just show current color)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Color:")
                    // TODO: Add color picker component
                    Text(color)
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(note.ifBlank { null }, color, emptyList()) }) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

