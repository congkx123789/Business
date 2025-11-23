package com.storysphere.storyreader.ui.community.paragraphcomments

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun ParagraphCommentBubble(
    count: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bubbleColor by animateColorAsState(
        targetValue = if (count > 0) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
        label = "bubbleColor"
    )
    val alpha by animateFloatAsState(
        targetValue = if (count > 0) 1f else 0.35f,
        label = "bubbleAlpha"
    )

    Box(
        modifier = modifier
            .size(32.dp)
            .alpha(alpha)
            .background(bubbleColor, CircleShape)
            .clickable(enabled = true, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = count.takeIf { it > 0 }?.toString() ?: "+",
            style = MaterialTheme.typography.labelSmall,
            color = Color.White
        )
    }
}


