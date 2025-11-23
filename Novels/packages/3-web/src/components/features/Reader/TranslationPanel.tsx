"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface TranslationPanelProps {
  text?: string;
}

export const TranslationPanel: React.FC<TranslationPanelProps> = ({ text = "" }) => {
  const { translation, isLoading, translate, error, clear } = useTranslation();
  const [targetLang, setTargetLang] = useState("en");

  const handleTranslate = () => {
    if (!text.trim()) return;
    translate({
      text,
      sourceLang: "auto",
      targetLang,
      context: "reader",
    });
  };

  if (!text.trim()) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-background/80 p-4 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={targetLang}
          onChange={(event) => setTargetLang(event.target.value)}
        >
          <option value="en">English</option>
          <option value="vi">Vietnamese</option>
          <option value="zh">Chinese</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
        <Button size="sm" onClick={handleTranslate} disabled={isLoading}>
          {isLoading ? "Translating…" : "Translate"}
        </Button>
        {translation && (
          <Button size="sm" variant="ghost" onClick={clear}>
            Clear
          </Button>
        )}
      </div>
      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
      {translation && (
        <div className="mt-4 rounded-lg border border-dashed border-border/60 bg-muted/30 p-3 text-sm">
          {translation}
        </div>
      )}
    </div>
  );
};


