package com.storysphere.storyreader.ui.community.platforminteractions.quizzes

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun QuizList(
    quizzes: List<Quiz>,
    onQuizClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(quizzes) { quiz ->
            QuizCard(
                quizId = quiz.id,
                title = quiz.title,
                description = quiz.description,
                questionCount = quiz.questionCount,
                onStart = { onQuizClick(quiz.id) },
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

data class Quiz(
    val id: String,
    val title: String,
    val description: String,
    val questionCount: Int
)

