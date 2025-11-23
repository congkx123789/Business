"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ReaderContent } from "./ReaderContent";
import { ReaderControls } from "./ReaderControls";
import { useStory, useChapter, useChapters } from "@/lib/hooks/useStories";
import { useReadingPreferences } from "@/lib/hooks/useReadingPreferences";
import { useReadingProgress, useUpdateReadingProgress } from "@/lib/hooks/useReadingProgress";
import { useReaderUIStore } from "@/store/reader-ui-store";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/lib/hooks/useDictionary";
import { DictionaryPopup } from "./DictionaryPopup";
import { TranslationPanel } from "./TranslationPanel";
import { TTSPlayer } from "./TTSPlayer";
import { useMultiWindow } from "@/lib/hooks/desktop/useMultiWindow";
import { useKeyboardShortcuts } from "@/lib/hooks/desktop/useKeyboardShortcuts";
import { useBookmarks, useCreateBookmark, useDeleteBookmark } from "@/lib/hooks/useBookmarks";
import { TableOfContents } from "./TableOfContents";
import { ReaderSearch } from "./ReaderSearch";

interface ReaderContainerProps {
  storyId: string;
  initialChapterId?: string | null;
}

export const ReaderContainer: React.FC<ReaderContainerProps> = ({
  storyId,
  initialChapterId,
}) => {
  const router = useRouter();
  const { showControls, toggleControls, hideControls, openSettings, setInteraction } = useReaderUIStore();
  const [isTOCOpen, setIsTOCOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const { data: bookmarks } = useBookmarks(storyId, currentChapterId || undefined);
  const createBookmark = useCreateBookmark();
  const deleteBookmark = useDeleteBookmark();

  const { data: story, isLoading: storyLoading } = useStory(storyId);
  const { data: chapters, isLoading: chaptersLoading } = useChapters(storyId);
  const { data: preferences } = useReadingPreferences();
  const { data: readingProgress } = useReadingProgress(storyId);
  const updateReadingProgress = useUpdateReadingProgress();
  const scrollRestoredRef = useRef(false);
  const {
    entry: dictionaryEntry,
    isLoading: dictionaryLoading,
    lookup: lookupWord,
    clear: clearDictionary,
  } = useDictionary();

  const [activeChapterId, setActiveChapterId] = useState<string | null>(initialChapterId || null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [dictionaryPosition, setDictionaryPosition] = useState<{ x: number; y: number } | null>(null);
  const { tabs, activeTab, openTab, updateTab, switchTab } = useMultiWindow();
  const chapterList = useMemo(
    () =>
      (Array.isArray(chapters) ? chapters : []) as Array<{
        id: string | number;
        title?: string;
      }>,
    [chapters]
  );

  // Auto-open/create tab when component mounts
  useEffect(() => {
    if (!story?.title) return;
    
    // Check if tab already exists for this story/chapter
    const existingTab = tabs.find(
      (t) => t.storyId === storyId && t.chapterId === (initialChapterId || undefined)
    );
    
    if (existingTab) {
      // Switch to existing tab
      switchTab(existingTab.id);
      // Update tab title if story title changed
      if (existingTab.title !== story.title) {
        updateTab(existingTab.id, { title: story.title });
      }
    } else {
      // Create new tab
      openTab({
        storyId,
        chapterId: initialChapterId || undefined,
        title: story.title,
        pinned: false,
      });
    }
  }, [story?.title, storyId, initialChapterId, tabs, openTab, switchTab, updateTab]);

  useEffect(() => {
    setActiveChapterId(initialChapterId || null);
  }, [initialChapterId]);

  useEffect(() => {
    if (!readingProgress?.chapterId) return;
    if (activeChapterId) return;
    setActiveChapterId(String(readingProgress.chapterId));
  }, [readingProgress?.chapterId, activeChapterId]);

  useEffect(() => {
    if (!activeChapterId && chapterList.length) {
      setActiveChapterId(String(chapterList[0].id));
    }
  }, [activeChapterId, chapterList]);

  const currentChapterId = activeChapterId || (chapterList[0]?.id ? String(chapterList[0].id) : null);
  const { data: chapter, isLoading: chapterLoading } = useChapter(
    storyId,
    currentChapterId || ""
  );

  useEffect(() => {
    if (chapter?.id) {
      updateReadingProgress.mutate({
        storyId,
        chapterId: String(chapter.id),
      });
      
      // Update active tab's chapterId
      if (activeTab) {
        updateTab(activeTab.id, { chapterId: String(chapter.id) });
      }
    }
  }, [chapter?.id, storyId, updateReadingProgress, activeTab, updateTab]);

  useEffect(() => {
    scrollRestoredRef.current = false;
  }, [chapter?.id]);

  useEffect(() => {
    if (!readingProgress?.position) return;
    if (preferences?.readingMode !== "scroll") return;
    if (!chapter?.id) return;
    if (scrollRestoredRef.current) return;

    scrollRestoredRef.current = true;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    const target = maxScroll * readingProgress.position;
    window.scrollTo({ top: target });
  }, [readingProgress?.position, preferences?.readingMode, chapter?.id]);

  const handleChapterChange = useCallback(
    (chapterId: string) => {
      if (!chapterId) return;
      setActiveChapterId(chapterId);
      router.replace(`/reader/${storyId}/${chapterId}`);
      setInteraction();
    },
    [router, setInteraction, storyId]
  );

  const handlePrevChapter = () => {
    if (!currentChapterId) return;
    const index = chapterList.findIndex((chapter) => String(chapter.id) === currentChapterId);
    if (index > 0) {
      handleChapterChange(String(chapterList[index - 1].id));
    }
  };

  const handleNextChapter = () => {
    if (!currentChapterId) return;
    const index = chapterList.findIndex((chapter) => String(chapter.id) === currentChapterId);
    if (index >= 0 && index < chapterList.length - 1) {
      handleChapterChange(String(chapterList[index + 1].id));
    }
  };

  useEffect(() => {
    if (!showControls) return;
    if (!preferences?.autoHideControls) return;

    const timeout = setTimeout(() => {
      hideControls();
    }, preferences?.controlsTimeout ?? 4000);
    return () => clearTimeout(timeout);
  }, [showControls, hideControls, preferences?.autoHideControls, preferences?.controlsTimeout]);

  const handleReaderClick = () => {
    if (preferences?.tapToToggleControls === false) return;
    toggleControls();
  };

  const handleParagraphClick = (paragraphIndex: number) => {
    // Paragraph comment integration handled by ParagraphCommentBubble component
  };

  const handleSelectionChange = useCallback(
    (payload: { text: string; rect: DOMRect | null }) => {
      if (!payload.text) {
        setSelectedText("");
        setDictionaryPosition(null);
        clearDictionary();
        return;
      }

      setSelectedText(payload.text);
      if (payload.rect) {
        const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
        setDictionaryPosition({
          x: payload.rect.left + payload.rect.width / 2,
          y: payload.rect.bottom + scrollY + 12,
        });
      } else {
        setDictionaryPosition(null);
      }
      lookupWord(payload.text);
    },
    [lookupWord, clearDictionary]
  );

  useEffect(() => {
    if (!currentChapterId || preferences?.readingMode !== "scroll") {
      return;
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        if (typeof window === "undefined") return;
        const doc = document.documentElement;
        const progress =
          doc.scrollHeight - doc.clientHeight === 0
            ? 0
            : doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
        updateReadingProgress.mutate({
          storyId,
          chapterId: currentChapterId,
          position: Number(progress.toFixed(3)),
        });
      }, 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [currentChapterId, preferences?.readingMode, storyId, updateReadingProgress]);

  // Check if current chapter is paid content (for DRM protection)
  const isPaidContent = chapter?.isPaid || false;

  // Register keyboard shortcuts for reader
  useKeyboardShortcuts(
    [
      // Page navigation (page-turn mode)
      {
        action: "reader.next-page",
        handler: () => {
          if (preferences?.readingMode === "page-turn") {
            // Scroll down one page
            window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
          } else {
            handleNextChapter();
          }
        },
      },
      {
        action: "reader.previous-page",
        handler: () => {
          if (preferences?.readingMode === "page-turn") {
            // Scroll up one page
            window.scrollBy({ top: -window.innerHeight * 0.9, behavior: "smooth" });
          } else {
            handlePrevChapter();
          }
        },
      },
      // Scroll navigation (scroll mode)
      {
        action: "reader.scroll-down-paragraph",
        handler: () => {
          if (preferences?.readingMode === "scroll") {
            const paragraphs = document.querySelectorAll("p");
            const currentScroll = window.scrollY;
            for (const para of paragraphs) {
              const rect = para.getBoundingClientRect();
              if (rect.top > currentScroll + 100) {
                para.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
              }
            }
          }
        },
      },
      {
        action: "reader.scroll-up-paragraph",
        handler: () => {
          if (preferences?.readingMode === "scroll") {
            const paragraphs = Array.from(document.querySelectorAll("p")).reverse();
            const currentScroll = window.scrollY;
            for (const para of paragraphs) {
              const rect = para.getBoundingClientRect();
              if (rect.top < currentScroll - 100) {
                para.scrollIntoView({ behavior: "smooth", block: "start" });
                break;
              }
            }
          }
        },
      },
      {
        action: "reader.scroll-down-page",
        handler: () => {
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
        },
      },
      {
        action: "reader.scroll-up-page",
        handler: () => {
          window.scrollBy({ top: -window.innerHeight * 0.9, behavior: "smooth" });
        },
      },
      // Interface navigation
      {
        action: "reader.toggle-toc",
        handler: () => {
          setIsTOCOpen((prev) => !prev);
        },
      },
      {
        action: "reader.toggle-bookmark",
        handler: async () => {
          // Toggle bookmark for current chapter
          if (!currentChapterId || !storyId) return;
          
          // Check if bookmark exists
          const existingBookmark = bookmarks?.find(
            (b) => String(b.chapterId) === currentChapterId && String(b.storyId) === storyId
          );
          
          if (existingBookmark) {
            // Delete bookmark
            deleteBookmark.mutate(String(existingBookmark.id));
          } else {
            // Create bookmark
            createBookmark.mutate({
              storyId,
              chapterId: currentChapterId,
            });
          }
        },
      },
      {
        action: "reader.open-settings",
        handler: () => {
          openSettings();
        },
      },
      {
        action: "reader.return-library",
        handler: () => {
          router.push("/library");
        },
      },
      // Accessibility
      {
        action: "reader.play-pause-tts",
        handler: () => {
          // TTS play/pause - trigger click on TTS play button
          const ttsPlayButton = document.querySelector('[data-tts-play]') as HTMLButtonElement;
          if (ttsPlayButton && !ttsPlayButton.disabled) {
            ttsPlayButton.click();
          }
        },
      },
      {
        action: "reader.search",
        handler: () => {
          // Open search in book
          setIsSearchOpen(true);
          // Focus search input after it's rendered
          setTimeout(() => {
            const searchInput = document.querySelector("[data-reader-search]") as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
            }
          }, 100);
        },
      },
    ],
    "reader",
    isPaidContent
  );

  const loadingState = storyLoading || chaptersLoading || chapterLoading;

  return (
    <div className="relative min-h-screen w-full bg-background">
      {loadingState && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          Loading reader...
        </div>
      )}
      <div className={cn("w-full", loadingState && "opacity-50 pointer-events-none")}>
        <div onClick={handleReaderClick}>
          <ReaderContent
            chapter={
              chapter
                ? {
                    id: String(chapter.id),
                    title: chapter.title,
                    content: chapter.content,
                    index: chapter.index,
                  }
                : null
            }
            preferences={preferences}
            onParagraphClick={handleParagraphClick}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-4 px-4">
          <TTSPlayer text={chapter?.content || ""} disabled={!chapter} />
          {selectedText && (
            <div id="reader-translation-panel">
              <TranslationPanel text={selectedText} />
            </div>
          )}
        </div>
        <ReaderControls
          storyTitle={story?.title}
          chapters={chapterList.map((chapter) => ({
            id: String(chapter.id),
            title: chapter.title || `Chapter ${chapter.id}`,
          }))}
          currentChapterId={currentChapterId}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          onChapterSelect={handleChapterChange}
          onOpenSettings={openSettings}
          onToggleMenu={toggleControls}
          readingMode={preferences?.readingMode ?? "scroll"}
        />
      </div>
      <TableOfContents
        chapters={chapterList.map((chapter) => ({
          id: String(chapter.id),
          title: chapter.title || `Chapter ${chapter.id}`,
          index: chapter.index,
        }))}
        currentChapterId={currentChapterId}
        isOpen={isTOCOpen}
        onClose={() => setIsTOCOpen(false)}
        onChapterSelect={handleChapterChange}
      />
      <ReaderSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        content={chapter?.content || ""}
      />
      <DictionaryPopup
        entry={dictionaryEntry}
        position={dictionaryPosition}
        isLoading={dictionaryLoading}
        onClose={() => {
          setDictionaryPosition(null);
          setSelectedText("");
          clearDictionary();
        }}
        onTranslate={
          selectedText
            ? () => {
                if (typeof document === "undefined") return;
                const panel = document.getElementById("reader-translation-panel");
                panel?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            : undefined
        }
      />
    </div>
  );
};

