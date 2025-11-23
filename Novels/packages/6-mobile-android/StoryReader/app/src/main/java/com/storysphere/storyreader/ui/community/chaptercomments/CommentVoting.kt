package com.storysphere.storyreader.ui.community.chaptercomments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun CommentVoting(
    likeCount: Int,
    dislikeCount: Int,
    onVote: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        IconButton(onClick = { onVote(true) }) {
            Icon(imageVector = Icons.Default.KeyboardArrowUp, contentDescription = "Upvote")
        }
        Text(text = likeCount.toString())
        IconButton(onClick = { onVote(false) }) {
            Icon(imageVector = Icons.Default.KeyboardArrowDown, contentDescription = "Downvote")
        }
        Text(text = dislikeCount.toString())
    }
}

