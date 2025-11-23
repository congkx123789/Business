package com.storysphere.storyreader.ui.community.chaptercomments

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ChapterComment
import com.storysphere.storyreader.model.ChapterCommentSort

@Composable
fun ChapterCommentsSection(
    comments: List<ChapterComment>,
    selectedSort: ChapterCommentSort,
    onSortChange: (ChapterCommentSort) -> Unit,
    onVote: (String, Boolean) -> Unit,
    onSubmit: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.padding(top = 24.dp)) {
        Text(
            text = "Chapter Discussion",
            style = MaterialTheme.typography.titleMedium
        )
        Spacer(modifier = Modifier.height(8.dp))
        CommentSortSelector(
            selected = selectedSort,
            onSortChange = onSortChange
        )
        Spacer(modifier = Modifier.height(12.dp))
        ChapterCommentThread(
            comments = comments,
            onVote = onVote
        )
        Spacer(modifier = Modifier.height(12.dp))
        ChapterCommentForm(onSubmit = onSubmit)
    }
}

