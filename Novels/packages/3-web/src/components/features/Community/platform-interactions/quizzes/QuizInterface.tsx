"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSubmitQuiz } from "@/lib/hooks/useQuizzes";

interface QuizInterfaceProps {
  quiz: {
    id: string;
    title: string;
    questions: Array<{
      id: string;
      text: string;
      options: Array<{ id: string; text: string }>;
    }>;
  };
  onClose: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, onClose }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const submitQuiz = useSubmitQuiz();

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    await submitQuiz.mutateAsync({ quizId: quiz.id, answers });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-background">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Quiz</p>
            <h3 className="text-xl font-semibold">{quiz.title}</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="space-y-6 overflow-y-auto p-6">
          {quiz.questions.map((question) => (
            <div key={question.id} className="space-y-3 rounded-lg border border-border/50 p-4">
              <p className="font-medium">{question.text}</p>
              <div className="grid gap-2">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleAnswer(question.id, option.id)}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {option.text}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end border-t border-border px-6 py-4">
          <Button onClick={handleSubmit} disabled={submitQuiz.isPending}>
            {submitQuiz.isPending ? "Submitting..." : "Submit Answers"}
          </Button>
        </div>
      </div>
    </div>
  );
};

