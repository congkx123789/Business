package com.storysphere.storyreader.ui.mobile.readerenhanced

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AdvancedAnnotationEditor(
    initialText: String = "",
    onSave: (String) -> Unit = {},
    onCancel: () -> Unit = {}
) {
    var annotationText by remember { mutableStateOf(initialText) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        OutlinedTextField(
            value = annotationText,
            onValueChange = { annotationText = it },
            label = { Text("Annotation") },
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            minLines = 10
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            TextButton(onClick = onCancel) {
                Text("Cancel")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(onClick = { onSave(annotationText) }) {
                Text("Save")
            }
        }
    }
}

