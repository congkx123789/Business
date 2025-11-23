package com.storysphere.storyreader.ui.community.reviews

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ThumbDown
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ReviewHelpfulVoting(
    likeCount: Int,
    dislikeCount: Int,
    onVote: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = { onVote(true) }) {
            Icon(imageVector = Icons.Default.ThumbUp, contentDescription = "Helpful")
        }
        Text(text = likeCount.toString())
        IconButton(onClick = { onVote(false) }) {
            Icon(imageVector = Icons.Default.ThumbDown, contentDescription = "Not helpful")
        }
        Text(text = dislikeCount.toString())
    }
}

