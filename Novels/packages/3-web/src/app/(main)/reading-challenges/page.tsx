"use client";

import { ReadingChallengesDashboard } from "@/components/features/ReadingChallengesDashboard";

export default function ReadingChallengesPage() {
  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Reading Challenges & Goals</h1>
        <p className="text-muted-foreground">
          Create book-club style challenges, follow friends’ progress, and keep track of your reading goals.
        </p>
      </header>

      <ReadingChallengesDashboard />
    </div>
  );
}

