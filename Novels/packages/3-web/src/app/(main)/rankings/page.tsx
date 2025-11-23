// Rankings page
"use client";

import React from "react";
import { useRankings } from "@/lib/hooks/useDiscovery";

export default function RankingsPage() {
  const { data: rankings } = useRankings();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Rankings</h1>
      
      <div className="space-y-6">
        {rankings?.map((ranking: { id: string; title: string; stories: unknown[] }) => (
          <div key={ranking.id} className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">{ranking.title}</h2>
            <div className="space-y-2">
              {ranking.stories?.map((story: { id: string; title: string; rank: number }) => (
                <div key={story.id} className="flex items-center gap-4">
                  <span className="font-bold text-lg w-8">#{story.rank}</span>
                  <span className="text-lg">{story.title}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

