"use client";

import React, { useRef, useEffect } from "react";
import { Tab } from "@/store/desktop/multi-window-store";
import { TabItem } from "./TabItem";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabPin: (tabId: string) => void;
  onTabContextMenu?: (tabId: string, e: React.MouseEvent) => void;
  onReorder?: (tabIds: string[]) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onTabPin,
  onTabContextMenu,
  onReorder,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  // Check scroll position
  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [tabs]);

  // Scroll to active tab
  useEffect(() => {
    if (!scrollContainerRef.current || !activeTabId) return;
    const activeTabElement = scrollContainerRef.current.querySelector(
      `[data-tab-id="${activeTabId}"]`
    );
    if (activeTabElement) {
      activeTabElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTabId]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 200;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Sort tabs: pinned first, then by order
  const sortedTabs = React.useMemo(() => {
    const pinned = tabs.filter((t) => t.pinned);
    const unpinned = tabs.filter((t) => !t.pinned);
    return [...pinned, ...unpinned];
  }, [tabs]);

  return (
    <div className="relative flex items-center border-b border-border bg-muted/30">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 flex h-full items-center bg-background/80 px-2 backdrop-blur-sm"
          aria-label="Scroll tabs left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}
      <div
        ref={scrollContainerRef}
        className="flex flex-1 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="flex min-w-0">
          {sortedTabs.map((tab) => (
            <div key={tab.id} data-tab-id={tab.id}>
              <TabItem
                tab={tab}
                isActive={tab.id === activeTabId}
                onClick={() => onTabClick(tab.id)}
                onClose={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.id);
                }}
                onPin={(e) => {
                  e.stopPropagation();
                  onTabPin(tab.id);
                }}
                onContextMenu={(e) => onTabContextMenu?.(tab.id, e)}
              />
            </div>
          ))}
        </div>
      </div>
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 flex h-full items-center bg-background/80 px-2 backdrop-blur-sm"
          aria-label="Scroll tabs right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

