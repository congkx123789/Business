package com.storysphere.storyreader.ui.community.reviews

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ReviewRatings

@Composable
fun ReviewForm(
    onSubmit: (String, ReviewRatings) -> Unit,
    modifier: Modifier = Modifier
) {
    var content by remember { mutableStateOf("") }
    var plot by remember { mutableStateOf(4f) }
    var characters by remember { mutableStateOf(4f) }
    var world by remember { mutableStateOf(4f) }
    var writing by remember { mutableStateOf(4f) }

    Column(modifier = modifier.fillMaxWidth()) {
        RatingSlider("Plot", plot) { plot = it }
        RatingSlider("Characters", characters) { characters = it }
        RatingSlider("World Building", world) { world = it }
        RatingSlider("Writing Style", writing) { writing = it }
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = content,
            onValueChange = { content = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Write your review") }
        )
        Spacer(modifier = Modifier.height(8.dp))
        Button(
            onClick = {
                if (content.isNotBlank()) {
                    onSubmit(
                        content.trim(),
                        ReviewRatings(
                            plot = plot.toInt(),
                            characters = characters.toInt(),
                            worldBuilding = world.toInt(),
                            writingStyle = writing.toInt()
                        )
                    )
                    content = ""
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Submit Review")
        }
    }
}

@Composable
private fun RatingSlider(
    label: String,
    value: Float,
    onValueChange: (Float) -> Unit
) {
    Column {
        Text("$label - ${value.toInt()}/5")
        Slider(
            value = value,
            onValueChange = onValueChange,
            valueRange = 1f..5f,
            steps = 3,
            colors = SliderDefaults.colors()
        )
    }
}

