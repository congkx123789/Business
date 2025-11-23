// Search component for reader (Ctrl+F)
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ReaderSearchProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export const ReaderSearch: React.FC<ReaderSearchProps> = ({
  isOpen,
  onClose,
  content,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const matchesRef = useRef<number[]>([]);

  // Find all matches
  useEffect(() => {
    if (!searchTerm.trim() || !content) {
      matchesRef.current = [];
      setTotalMatches(0);
      setCurrentMatch(0);
      // Remove highlights
      const highlights = document.querySelectorAll("[data-search-highlight]");
      highlights.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ""), el);
          parent.normalize();
        }
      });
      return;
    }

    const regex = new RegExp(searchTerm, "gi");
    const matches: number[] = [];
    let match;
    let lastIndex = 0;

    // Find all match positions
    while ((match = regex.exec(content)) !== null) {
      matches.push(match.index);
      lastIndex = match.index + match[0].length;
    }

    matchesRef.current = matches;
    setTotalMatches(matches.length);
    setCurrentMatch(matches.length > 0 ? 1 : 0);
  }, [searchTerm, content]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setSearchTerm("");
      setCurrentMatch(0);
      setTotalMatches(0);
    }
  }, [isOpen]);

  const scrollToMatch = (matchIndex: number) => {
    if (matchIndex < 0 || matchIndex >= matchesRef.current.length) return;
    
    const matchPosition = matchesRef.current[matchIndex];
    if (matchPosition === undefined) return;

    // Find the paragraph containing this match
    const paragraphs = document.querySelectorAll("[data-paragraph-index]");
    let accumulatedLength = 0;
    
    for (const para of paragraphs) {
      const paraText = para.textContent || "";
      const paraLength = paraText.length;
      
      if (accumulatedLength + paraLength > matchPosition) {
        para.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight the match within the paragraph
        if (para instanceof HTMLElement) {
          para.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
          setTimeout(() => {
            para.style.backgroundColor = "";
          }, 1000);
        }
        break;
      }
      
      accumulatedLength += paraLength + 1; // +1 for newline
    }
  };

  const handleFindNext = () => {
    if (matchesRef.current.length === 0) return;
    const nextIndex = currentMatch >= matchesRef.current.length ? 1 : currentMatch + 1;
    setCurrentMatch(nextIndex);
    scrollToMatch(nextIndex - 1);
  };

  const handleFindPrevious = () => {
    if (matchesRef.current.length === 0) return;
    const prevIndex = currentMatch <= 1 ? matchesRef.current.length : currentMatch - 1;
    setCurrentMatch(prevIndex);
    scrollToMatch(prevIndex - 1);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleFindNext();
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        handleFindPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, currentMatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-background shadow-lg">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2">
        <Input
          ref={inputRef}
          data-reader-search
          type="text"
          placeholder="Search in chapter..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        {totalMatches > 0 && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {currentMatch} / {totalMatches}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFindPrevious}
            disabled={totalMatches === 0}
            title="Find Previous (Shift+Enter)"
          >
            ↑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFindNext}
            disabled={totalMatches === 0}
            title="Find Next (Enter)"
          >
            ↓
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} title="Close (Esc)">
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
};

