package com.storysphere.storyreader.ui.community.chaptercomments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ChapterComment

@Composable
fun ChapterCommentThread(
    comments: List<ChapterComment>,
    onVote: (String, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    if (comments.isEmpty()) {
        Text(
            text = "No chapter-end discussions yet. Start the conversation!",
            style = MaterialTheme.typography.bodyMedium,
            modifier = modifier.padding(16.dp)
        )
        return
    }

    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(comments, key = { it.id }) { comment ->
            ChapterCommentCard(comment = comment, onVote = onVote)
        }
    }
}

@Composable
private fun ChapterCommentCard(
    comment: ChapterComment,
    onVote: (String, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = comment.username + if (comment.isAuthor) " • Author" else "",
                    style = MaterialTheme.typography.labelLarge
                )
                Text(
                    text = "${comment.likeCount} ↑  |  ${comment.dislikeCount} ↓",
                    style = MaterialTheme.typography.labelSmall
                )
            }
            Text(
                text = comment.content,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            CommentVoting(
                likeCount = comment.likeCount,
                dislikeCount = comment.dislikeCount,
                onVote = { isUpVote -> onVote(comment.id, isUpVote) }
            )
            if (comment.replies.isNotEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 16.dp, top = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    comment.replies.forEach { reply ->
                        ChapterCommentCard(comment = reply, onVote = onVote)
                    }
                }
            }
        }
    }
}

