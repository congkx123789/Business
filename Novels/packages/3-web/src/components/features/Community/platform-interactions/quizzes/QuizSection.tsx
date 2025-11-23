"use client";

import React, { useState } from "react";
import { useQuizzes } from "@/lib/hooks/useQuizzes";
import { QuizList } from "./QuizList";
import { QuizInterface } from "./QuizInterface";
import { Button } from "@/components/ui/button";

interface QuizSectionProps {
  storyId: string;
}

export const QuizSection: React.FC<QuizSectionProps> = ({ storyId }) => {
  const { data: quizzes, isLoading, refetch } = useQuizzes(storyId);
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  const activeQuiz = quizzes?.find((quiz: any) => quiz.id === activeQuizId);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Community</p>
          <h2 className="text-2xl font-bold">Quizzes</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Loading quizzes...
        </div>
      ) : (
        <QuizList
          quizzes={(quizzes || []).map((quiz: any) => ({
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            questionCount: quiz.questionCount ?? quiz.questions?.length ?? 0,
            difficulty: quiz.difficulty,
            expiresAt: quiz.expiresAt,
          }))}
          onStart={setActiveQuizId}
        />
      )}

      {activeQuiz && (
        <QuizInterface
          quiz={{
            id: activeQuiz.id,
            title: activeQuiz.title,
            questions: activeQuiz.questions || [],
          }}
          onClose={() => setActiveQuizId(null)}
        />
      )}
    </section>
  );
};

