package com.storysphere.storyreader.ui.community.reviews

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ReviewRatings

@Composable
fun ReviewRatingsBar(
    ratings: ReviewRatings,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        RatingRow(label = "Plot", value = ratings.plot)
        RatingRow(label = "Characters", value = ratings.characters)
        RatingRow(label = "World", value = ratings.worldBuilding)
        RatingRow(label = "Writing", value = ratings.writingStyle)
        Text(
            text = "Avg: ${"%.1f".format(ratings.average)} / 5",
            style = MaterialTheme.typography.labelMedium
        )
    }
}

@Composable
private fun RatingRow(label: String, value: Int) {
    Column {
        Text(text = "$label - $value/5", style = MaterialTheme.typography.labelSmall)
        LinearProgressIndicator(
            progress = value / 5f,
            modifier = Modifier.fillMaxWidth(),
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
    }
}

