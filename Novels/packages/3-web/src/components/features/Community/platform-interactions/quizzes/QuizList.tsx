"use client";

import React from "react";
import { Quiz, QuizCard } from "./QuizCard";

interface QuizListProps {
  quizzes: Quiz[];
  onStart: (quizId: string) => void;
}

export const QuizList: React.FC<QuizListProps> = ({ quizzes, onStart }) => {
  if (quizzes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        No quizzes available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} onStart={onStart} />
      ))}
    </div>
  );
};

