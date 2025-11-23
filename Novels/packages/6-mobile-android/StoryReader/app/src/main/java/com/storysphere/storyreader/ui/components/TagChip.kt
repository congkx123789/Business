package com.storysphere.storyreader.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.Tag

@Composable
fun TagChip(
    tag: Tag,
    onClick: () -> Unit = {},
    onRemove: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    AssistChip(
        onClick = onClick,
        label = { Text(tag.name) },
        modifier = modifier,
        trailingIcon = onRemove?.let {
            {
                IconButton(
                    onClick = it,
                    modifier = Modifier.size(16.dp)
                ) {
                    Text("×")
                }
            }
        },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = tag.color?.let { 
                androidx.compose.ui.graphics.Color(android.graphics.Color.parseColor(it))
            } ?: MaterialTheme.colorScheme.primaryContainer
        )
    )
}

@Composable
fun TagChipList(
    tags: List<Tag>,
    onTagClick: (Tag) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        tags.forEach { tag ->
            TagChip(
                tag = tag,
                onClick = { onTagClick(tag) }
            )
        }
    }
}

