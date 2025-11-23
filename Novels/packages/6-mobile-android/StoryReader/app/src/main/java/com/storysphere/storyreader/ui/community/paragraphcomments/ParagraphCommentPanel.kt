package com.storysphere.storyreader.ui.community.paragraphcomments

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.storysphere.storyreader.model.ParagraphComment
import com.storysphere.storyreader.model.ParagraphReactionType

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ParagraphCommentPanel(
    paragraphIndex: Int,
    comments: List<ParagraphComment>,
    isLoading: Boolean,
    onDismiss: () -> Unit,
    onSubmitComment: (String) -> Unit,
    onReactionSelected: (ParagraphReactionType) -> Unit,
    onLike: (String) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var commentText by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Paragraph ${paragraphIndex + 1}",
                style = MaterialTheme.typography.titleMedium
            )

            QuickReactionButtons(
                onReactionSelected = onReactionSelected
            )

            ParagraphCommentList(
                comments = comments,
                onLike = onLike,
                modifier = Modifier.weight(1f, fill = true)
            )

            OutlinedTextField(
                value = commentText,
                onValueChange = { commentText = it },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Add a comment") },
                singleLine = false,
                supportingText = {
                    if (isLoading) {
                        Text("Sending…")
                    }
                }
            )

            Button(
                onClick = {
                    if (commentText.isNotBlank()) {
                        onSubmitComment(commentText.trim())
                        commentText = ""
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Send comment")
            }
        }
    }
}

