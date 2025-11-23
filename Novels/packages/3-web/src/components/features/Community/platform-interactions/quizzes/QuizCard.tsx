"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  difficulty?: "easy" | "medium" | "hard";
  expiresAt?: string;
}

interface QuizCardProps {
  quiz: Quiz;
  onStart: (quizId: string) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart }) => {
  return (
    <Card className="border-border/60 bg-card/70">
      <CardHeader>
        <CardTitle className="text-lg">{quiz.title}</CardTitle>
        {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="space-y-1">
          <p>{quiz.questionCount} questions</p>
          {quiz.difficulty && <p>Difficulty: {quiz.difficulty}</p>}
          {quiz.expiresAt && <p>Ends {new Date(quiz.expiresAt).toLocaleDateString()}</p>}
        </div>
        <button
          type="button"
          className="rounded-full border border-primary px-4 py-1 text-primary transition hover:bg-primary/10"
          onClick={() => onStart(quiz.id)}
        >
          Start
        </button>
      </CardContent>
    </Card>
  );
};

