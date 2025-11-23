package com.storysphere.storyreader.ui.community.platforminteractions.quizzes

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun QuizResults(
    quizId: String,
    totalQuestions: Int,
    correctAnswers: Int,
    score: Int,
    onRetake: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Quiz Complete!",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Score: $score%",
            style = MaterialTheme.typography.headlineSmall
        )
        Text(
            text = "Correct: $correctAnswers / $totalQuestions",
            style = MaterialTheme.typography.bodyLarge
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(onClick = onRetake) {
            Text("Retake Quiz")
        }
    }
}

