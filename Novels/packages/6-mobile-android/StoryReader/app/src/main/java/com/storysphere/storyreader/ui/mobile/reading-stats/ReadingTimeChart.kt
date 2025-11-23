package com.storysphere.storyreader.ui.mobile.readingstats

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ReadingTimeChart(
    data: List<ReadingTimeDataPoint>,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Reading Time",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(16.dp))
            // In production, use MPAndroidChart or similar
            // For now, show a simple representation
            data.forEach { point ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(point.date)
                    Text("${point.minutes} min")
                }
            }
        }
    }
}

data class ReadingTimeDataPoint(
    val date: String,
    val minutes: Double
)

