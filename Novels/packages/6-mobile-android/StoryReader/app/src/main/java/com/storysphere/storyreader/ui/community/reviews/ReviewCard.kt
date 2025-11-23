package com.storysphere.storyreader.ui.community.reviews

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.Review

@Composable
fun ReviewCard(
    review: Review,
    onVote: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Text(
                text = review.username + if (review.isAuthor) " • Author" else "",
                style = MaterialTheme.typography.labelLarge
            )
            Text(
                text = "${"%.1f".format(review.ratings.average)}/5 overall",
                style = MaterialTheme.typography.labelSmall
            )
            ReviewRatingsBar(
                ratings = review.ratings,
                modifier = Modifier.padding(vertical = 8.dp)
            )
            Text(
                text = review.content,
                style = MaterialTheme.typography.bodyMedium
            )
            ReviewHelpfulVoting(
                likeCount = review.likeCount,
                dislikeCount = review.dislikeCount,
                onVote = onVote,
                modifier = Modifier.padding(top = 8.dp)
            )
        }
    }
}

