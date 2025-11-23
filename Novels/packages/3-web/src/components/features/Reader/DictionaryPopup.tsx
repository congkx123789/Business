"use client";

import React from "react";
import { DictionaryEntry } from "@/lib/hooks/useDictionary";
import { Button } from "@/components/ui/button";

interface DictionaryPopupProps {
  entry: DictionaryEntry | null;
  position: { x: number; y: number } | null;
  isLoading: boolean;
  onClose: () => void;
  onTranslate?: () => void;
}

export const DictionaryPopup: React.FC<DictionaryPopupProps> = ({
  entry,
  position,
  isLoading,
  onClose,
  onTranslate,
}) => {
  if (!position) {
    return null;
  }

  const viewportWidth = typeof window === "undefined" ? 0 : window.innerWidth;
  const clampedLeft = Math.min(
    Math.max(position.x, 120),
    Math.max(120, viewportWidth - 120)
  );

  return (
    <div
      className="fixed z-50 w-80 -translate-x-1/2 rounded-2xl border border-border bg-background/95 p-4 text-sm shadow-2xl backdrop-blur"
      style={{
        top: Math.max(position.y, 80),
        left: clampedLeft,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Dictionary</p>
          <h3 className="text-lg font-semibold">{entry?.word}</h3>
          {entry?.phonetic && <p className="text-xs text-muted-foreground">{entry.phonetic}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-muted-foreground">Looking up…</p>
        ) : entry?.definition ? (
          <p>{entry.definition}</p>
        ) : (
          <p className="text-muted-foreground">No definition available.</p>
        )}

        {entry?.examples?.length ? (
          <div>
            <p className="text-xs uppercase text-muted-foreground">Examples</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {entry.examples.map((example: string) => (
                <li key={example} className="text-muted-foreground">
                  {example}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {onTranslate && (
          <Button size="sm" variant="outline" onClick={onTranslate}>
            Translate
          </Button>
        )}
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
};


