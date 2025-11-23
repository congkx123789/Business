"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMultiWindow } from "@/lib/hooks/desktop/useMultiWindow";
import { TabBar } from "./TabBar";
import { TabContextMenu } from "./TabContextMenu";
import { Tab } from "@/store/desktop/multi-window-store";
import { useKeyboardShortcuts } from "@/lib/hooks/desktop/useKeyboardShortcuts";

interface TabManagerProps {
  children?: React.ReactNode;
}

export const TabManager: React.FC<TabManagerProps> = ({ children }) => {
  const router = useRouter();
  const {
    tabs,
    activeTab,
    activeTabId,
    openTab,
    closeTab,
    switchTab,
    reorderTabs,
    pinTab,
    unpinTab,
    duplicateTab,
  } = useMultiWindow();

  const [contextMenu, setContextMenu] = useState<{
    tabId: string;
    x: number;
    y: number;
  } | null>(null);

  const handleTabClick = useCallback(
    (tabId: string) => {
      switchTab(tabId);
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        if (tab.chapterId) {
          router.push(`/reader/${tab.storyId}/${tab.chapterId}`);
        } else {
          router.push(`/reader/${tab.storyId}`);
        }
      }
    },
    [switchTab, tabs, router]
  );

  const handleTabClose = useCallback(
    (tabId: string) => {
      closeTab(tabId);
      // If closing active tab, navigate to library or next tab
      if (tabId === activeTabId) {
        const remainingTabs = tabs.filter((t) => t.id !== tabId);
        if (remainingTabs.length > 0) {
          const nextTab = remainingTabs[remainingTabs.length - 1];
          handleTabClick(nextTab.id);
        } else {
          router.push("/library");
        }
      }
    },
    [closeTab, activeTabId, tabs, handleTabClick, router]
  );

  const handleTabContextMenu = useCallback(
    (tabId: string, e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({
        tabId,
        x: e.clientX,
        y: e.clientY,
      });
    },
    []
  );

  const handleContextMenuAction = useCallback(
    (action: string) => {
      if (!contextMenu) return;
      const tabId = contextMenu.tabId;
      const tab = tabs.find((t) => t.id === tabId);

      switch (action) {
        case "close":
          handleTabClose(tabId);
          break;
        case "closeOthers":
          tabs.forEach((t) => {
            if (t.id !== tabId) {
              closeTab(t.id);
            }
          });
          break;
        case "closeAll":
          tabs.forEach((t) => closeTab(t.id));
          router.push("/library");
          break;
        case "pin":
          if (tab?.pinned) {
            unpinTab(tabId);
          } else {
            pinTab(tabId);
          }
          break;
        case "duplicate":
          if (tab) {
            duplicateTab(tabId);
          }
          break;
      }
      setContextMenu(null);
    },
    [contextMenu, tabs, handleTabClose, closeTab, pinTab, unpinTab, duplicateTab, router]
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Register keyboard shortcuts for tab navigation
  useKeyboardShortcuts(
    [
      {
        action: "global.next-tab",
        handler: () => {
          if (tabs.length <= 1) return;
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const nextIndex = (currentIndex + 1) % tabs.length;
          handleTabClick(tabs[nextIndex].id);
        },
      },
      {
        action: "global.previous-tab",
        handler: () => {
          if (tabs.length <= 1) return;
          const currentIndex = tabs.findIndex((t) => t.id === activeTabId);
          const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
          handleTabClick(tabs[prevIndex].id);
        },
      },
      {
        action: "global.close-tab",
        handler: () => {
          if (activeTabId) {
            handleTabClose(activeTabId);
          }
        },
      },
      {
        action: "global.new-tab",
        handler: () => {
          // Navigate to library to open new tab
          router.push("/library");
        },
      },
    ],
    "global"
  );

  // Expose openTab function globally for other components to use
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__openReaderTab = (
        storyId: string,
        chapterId?: string,
        title?: string
      ) => {
        const tabId = openTab({
          storyId,
          chapterId,
          title: title || `Story ${storyId}`,
          pinned: false,
        });
        handleTabClick(tabId);
        return tabId;
      };
    }
  }, [openTab, handleTabClick]);

  if (tabs.length === 0) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen flex-col">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onTabPin={(tabId) => {
          const tab = tabs.find((t) => t.id === tabId);
          if (tab?.pinned) {
            unpinTab(tabId);
          } else {
            pinTab(tabId);
          }
        }}
        onTabContextMenu={handleTabContextMenu}
      />
      <div className="flex-1 overflow-auto">
        {activeTab && (
          <div key={activeTab.id} className="h-full">
            {children}
          </div>
        )}
      </div>
      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={handleCloseContextMenu}
          onCloseTab={() => handleContextMenuAction("close")}
          onCloseOthers={() => handleContextMenuAction("closeOthers")}
          onCloseAll={() => handleContextMenuAction("closeAll")}
          onPin={() => handleContextMenuAction("pin")}
          onUnpin={() => handleContextMenuAction("pin")}
          onDuplicate={() => handleContextMenuAction("duplicate")}
          isPinned={tabs.find((t) => t.id === contextMenu.tabId)?.pinned || false}
        />
      )}
    </div>
  );
};

