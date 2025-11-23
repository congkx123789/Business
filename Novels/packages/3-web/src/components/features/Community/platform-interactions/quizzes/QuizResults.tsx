"use client";

import React from "react";

interface QuizResultsProps {
  score: number;
  total: number;
  correctAnswers?: Array<{ questionId: string; correctOptionId: string }>;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ score, total, correctAnswers }) => {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-4 text-center">
      <p className="text-sm text-muted-foreground">Your Score</p>
      <p className="text-3xl font-bold text-primary">
        {score} / {total}
      </p>
      <p className="text-sm text-muted-foreground">{percentage}% correct</p>
      {correctAnswers && (
        <details className="mt-4 text-left text-sm text-muted-foreground">
          <summary className="cursor-pointer font-semibold text-foreground">View correct answers</summary>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            {correctAnswers.map((answer) => (
              <li key={answer.questionId}>
                Question {answer.questionId}: Option {answer.correctOptionId}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

