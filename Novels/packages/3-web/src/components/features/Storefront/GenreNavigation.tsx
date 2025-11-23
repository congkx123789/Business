// Genre Navigation component
"use client";

import React from "react";
import { useGenres } from "@/lib/hooks/useDiscovery";
import Link from "next/link";
import { useDiscoveryStore } from "@/store/discovery-store";
import { cn } from "@/lib/utils";

export const GenreNavigation: React.FC = () => {
  const { data: genres, isLoading } = useGenres();
  const { selectedGenre, setSelectedGenre } = useDiscoveryStore();

  if (isLoading) {
    return <div className="container py-4">Loading genres...</div>;
  }

  return (
    <div className="container py-4 border-b">
      <div className="flex items-center gap-2 overflow-x-auto">
        <Link
          href="/browse"
          onClick={() => setSelectedGenre(null)}
          className={cn(
            "px-4 py-2 rounded-md whitespace-nowrap transition-colors",
            !selectedGenre
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          )}
        >
          All
        </Link>
        {genres?.map((genre: { id: string; name: string }) => (
          <Link
            key={genre.id}
            href={`/browse?genre=${genre.id}`}
            onClick={() => setSelectedGenre(genre.id)}
            className={cn(
              "px-4 py-2 rounded-md whitespace-nowrap transition-colors",
              selectedGenre === genre.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            )}
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

