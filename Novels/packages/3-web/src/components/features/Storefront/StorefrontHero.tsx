// Storefront Hero component - Hero section with Editor's Picks
"use client";

import React from "react";
import { useEditorPicks } from "@/lib/hooks/useDiscovery";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const StorefrontHero: React.FC = () => {
  const { data: editorPicks, isLoading } = useEditorPicks();

  if (isLoading) {
    return <div className="container py-12">Loading editor picks...</div>;
  }

  const featuredStory = editorPicks?.[0];

  if (!featuredStory) {
    return null;
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-lg mb-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${featuredStory.coverImage || "/placeholder-cover.jpg"})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>
      <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
        <div className="max-w-2xl">
          <div className="inline-block px-3 py-1 mb-4 text-sm font-semibold bg-primary rounded-full">
            Editor's Pick
          </div>
          <h1 className="text-4xl font-bold mb-4">{featuredStory.title}</h1>
          <p className="text-lg mb-6 line-clamp-2">{featuredStory.description}</p>
          <div className="flex gap-4">
            <Link href={`/reader/${featuredStory.id}`}>
              <Button size="lg">Start Reading</Button>
            </Link>
            <Link href={`/books/${featuredStory.id}`}>
              <Button variant="outline" size="lg">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

