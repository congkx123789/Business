package com.storysphere.storyreader.ui.community.platforminteractions.quizzes

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun QuizInterface(
    quizId: String,
    questions: List<QuizQuestion>,
    currentQuestionIndex: Int,
    onAnswerSelected: (String) -> Unit = {},
    onNext: () -> Unit = {},
    onSubmit: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val currentQuestion = questions.getOrNull(currentQuestionIndex)
    var selectedAnswer by remember { mutableStateOf<String?>(null) }

    if (currentQuestion != null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Question ${currentQuestionIndex + 1} of ${questions.size}",
                style = MaterialTheme.typography.titleSmall
            )
            Text(
                text = currentQuestion.question,
                style = MaterialTheme.typography.titleMedium
            )
            currentQuestion.options.forEach { option ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .selectable(
                            selected = selectedAnswer == option.id,
                            onClick = { selectedAnswer = option.id }
                        )
                        .padding(16.dp)
                ) {
                    RadioButton(
                        selected = selectedAnswer == option.id,
                        onClick = { selectedAnswer = option.id }
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(option.text)
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                if (currentQuestionIndex < questions.size - 1) {
                    Button(onClick = {
                        selectedAnswer?.let { onAnswerSelected(it) }
                        onNext()
                        selectedAnswer = null
                    }) {
                        Text("Next")
                    }
                } else {
                    Button(onClick = {
                        selectedAnswer?.let { onAnswerSelected(it) }
                        onSubmit()
                    }) {
                        Text("Submit")
                    }
                }
            }
        }
    }
}

data class QuizQuestion(
    val id: String,
    val question: String,
    val options: List<QuizOption>,
    val correctAnswerId: String
)

data class QuizOption(
    val id: String,
    val text: String
)

