package com.storysphere.storyreader.ui.community.paragraphcomments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ParagraphReactionType

@Composable
fun QuickReactionButtons(
    onReactionSelected: (ParagraphReactionType) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        ParagraphReactionType.values().forEach { reaction ->
            AssistChip(
                onClick = { onReactionSelected(reaction) },
                label = { Text(reaction.emoji) },
                colors = AssistChipDefaults.assistChipColors()
            )
        }
    }
}

