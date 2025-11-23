package com.storysphere.storyreader.ui.community.paragraphcomments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ThumbUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ParagraphComment

@Composable
fun ParagraphCommentList(
    comments: List<ParagraphComment>,
    onLike: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    if (comments.isEmpty()) {
        Text(
            text = "No comments yet. Be the first to react!",
            style = MaterialTheme.typography.bodyMedium,
            modifier = modifier.padding(16.dp)
        )
        return
    }

    LazyColumn(
        modifier = modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(comments, key = { it.id }) { comment ->
            CommentCard(comment = comment, onLike = onLike)
        }
    }
}

@Composable
private fun CommentCard(
    comment: ParagraphComment,
    onLike: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = comment.username + if (comment.isAuthor) " • Author" else "",
                    style = MaterialTheme.typography.labelLarge
                )
                Text(
                    text = comment.reaction?.emoji ?: "",
                    style = MaterialTheme.typography.titleMedium
                )
            }
            Text(
                text = comment.content,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Likes ${comment.likeCount}",
                    style = MaterialTheme.typography.labelSmall
                )
                IconButton(onClick = { onLike(comment.id) }) {
                    Icon(
                        imageVector = Icons.Default.ThumbUp,
                        contentDescription = "Like comment"
                    )
                }
            }
        }
    }
}

