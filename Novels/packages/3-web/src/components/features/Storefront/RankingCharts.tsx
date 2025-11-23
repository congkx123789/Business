// Ranking Charts component
"use client";

import React from "react";
import { useRankings } from "@/lib/hooks/useDiscovery";
import Link from "next/link";

export const RankingCharts: React.FC = () => {
  const { data: rankings, isLoading } = useRankings();

  if (isLoading) {
    return <div className="container py-8">Loading rankings...</div>;
  }

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">Rankings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rankings?.slice(0, 4).map((ranking: { id: string; title: string; stories: unknown[] }) => (
          <div key={ranking.id} className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-4">{ranking.title}</h3>
            <div className="space-y-2">
              {ranking.stories?.slice(0, 5).map((story: { id: string; title: string; rank: number }) => (
                <Link
                  key={story.id}
                  href={`/books/${story.id}`}
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span className="font-bold text-sm w-6">#{story.rank}</span>
                  <span className="text-sm line-clamp-1">{story.title}</span>
                </Link>
              ))}
            </div>
            <Link
              href="/rankings"
              className="block mt-4 text-sm text-primary hover:underline text-center"
            >
              View All →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

