package com.storysphere.storyreader.ui.community.chaptercomments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ChapterCommentSort

@Composable
fun CommentSortSelector(
    selected: ChapterCommentSort,
    onSortChange: (ChapterCommentSort) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        ChapterCommentSort.values().forEach { sort ->
            FilterChip(
                selected = sort == selected,
                onClick = { onSortChange(sort) },
                label = { Text(sort.label) },
                colors = FilterChipDefaults.filterChipColors()
            )
        }
    }
}

