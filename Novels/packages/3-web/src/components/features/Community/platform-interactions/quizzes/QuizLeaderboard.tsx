"use client";

import React from "react";

interface QuizLeaderboardProps {
  entries: Array<{
    user: { username: string; avatarUrl?: string };
    score: number;
    timeTaken?: number;
  }>;
}

export const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ entries }) => {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2 rounded-xl border border-border/60 bg-card/70 p-4">
      <h4 className="text-sm font-semibold text-muted-foreground">Leaderboard</h4>
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={entry.user.username} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">#{index + 1}</span>
              <span>{entry.user.username}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {entry.score} pts {entry.timeTaken ? `• ${entry.timeTaken}s` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

