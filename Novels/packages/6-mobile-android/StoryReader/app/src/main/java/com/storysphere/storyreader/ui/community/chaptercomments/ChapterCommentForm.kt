package com.storysphere.storyreader.ui.community.chaptercomments

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier

@Composable
fun ChapterCommentForm(
    onSubmit: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var comment by remember { mutableStateOf("") }

    Column(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = comment,
            onValueChange = { comment = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Share your thoughts about this chapter") }
        )
        Button(
            onClick = {
                if (comment.isNotBlank()) {
                    onSubmit(comment.trim())
                    comment = ""
                }
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Post comment")
        }
    }
}

