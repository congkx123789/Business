// Home page - Storefront with Discovery & Engagement
"use client";

import React from "react";
import { StorefrontHero } from "@/components/features/Storefront/StorefrontHero";
import { GenreNavigation } from "@/components/features/Storefront/GenreNavigation";
import { RankingCharts } from "@/components/features/Storefront/RankingCharts";
import { EditorPicksSection } from "@/components/features/Storefront/EditorPicksSection";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { useTrendingStories } from "@/lib/hooks/useRecommendations";
import Link from "next/link";

export default function HomePage() {
  const { data: recommendations } = useRecommendations({ limit: 8 });
  const { data: trending } = useTrendingStories({ limit: 8 });

  return (
    <div className="min-h-screen">
      <StorefrontHero />
      <GenreNavigation />

      <div className="container py-8">
        <RankingCharts />
      </div>

      <EditorPicksSection />

      {recommendations && recommendations.length > 0 && (
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <Link href="/browse?filter=recommended" className="text-sm text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((story: { id: string; title: string; description?: string }) => (
              <Link
                key={story.id}
                href={`/books/${story.id}`}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{story.title}</h3>
                {story.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{story.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {trending && trending.length > 0 && (
        <div className="container py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <Link href="/browse?filter=trending" className="text-sm text-primary hover:underline">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((story: { id: string; title: string; description?: string }) => (
              <Link
                key={story.id}
                href={`/books/${story.id}`}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{story.title}</h3>
                {story.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{story.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
