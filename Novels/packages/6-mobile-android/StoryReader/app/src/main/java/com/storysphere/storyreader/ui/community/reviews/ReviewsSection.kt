package com.storysphere.storyreader.ui.community.reviews

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.Review
import com.storysphere.storyreader.model.ReviewRatings

@Composable
fun ReviewsSection(
    reviews: List<Review>,
    onVote: (String, Boolean) -> Unit,
    onSubmit: (String, ReviewRatings) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Reader Reviews",
            style = MaterialTheme.typography.titleMedium
        )
        if (reviews.isEmpty()) {
            Text(
                text = "No reviews yet. Share your first impressions!",
                style = MaterialTheme.typography.bodyMedium
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(reviews, key = { it.id }) { review ->
                    ReviewCard(
                        review = review,
                        onVote = { helpful -> onVote(review.id, helpful) }
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(8.dp))
        ReviewForm(onSubmit = onSubmit)
    }
}

