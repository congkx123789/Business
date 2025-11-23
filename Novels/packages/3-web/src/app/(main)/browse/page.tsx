// Browse page - Genre browsing
"use client";

import React from "react";
import { useGenres, useGenreStories } from "@/lib/hooks/useDiscovery";
import { useDiscoveryStore } from "@/store/discovery-store";

export default function BrowsePage() {
  const { selectedGenre, setSelectedGenre } = useDiscoveryStore();
  const { data: genres } = useGenres();
  const { data: stories } = useGenreStories(selectedGenre, {});

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Stories</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Genres</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-md ${
              !selectedGenre ? "bg-primary text-primary-foreground" : "bg-secondary"
            }`}
          >
            All
          </button>
          {genres?.map((genre: { id: string; name: string }) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-4 py-2 rounded-md ${
                selectedGenre === genre.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {selectedGenre ? `Stories in ${genres?.find((g: { id: string }) => g.id === selectedGenre)?.name}` : "All Stories"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories?.map((story: { id: string; title: string; description: string }) => (
            <div key={story.id} className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{story.title}</h3>
              <p className="text-sm text-muted-foreground">{story.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

