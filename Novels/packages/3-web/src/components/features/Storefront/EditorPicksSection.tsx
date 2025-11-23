// Editor's Picks Section component
"use client";

import React from "react";
import { useEditorPicks } from "@/lib/hooks/useDiscovery";
import Link from "next/link";

export const EditorPicksSection: React.FC = () => {
  const { data: editorPicks, isLoading } = useEditorPicks();

  if (isLoading) {
    return <div className="container py-8">Loading editor picks...</div>;
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Editor's Picks</h2>
        <Link href="/browse?filter=editors-pick" className="text-sm text-primary hover:underline">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {editorPicks?.slice(0, 8).map((story: { id: string; title: string; description?: string; coverImage?: string }) => (
          <Link
            key={story.id}
            href={`/books/${story.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            {story.coverImage && (
              <div
                className="w-full h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${story.coverImage})` }}
              />
            )}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{story.title}</h3>
              {story.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{story.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

