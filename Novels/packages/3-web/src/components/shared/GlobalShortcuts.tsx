// Global keyboard shortcuts handler component
// Handles shortcuts that work across all pages (dark mode, fullscreen, etc.)
"use client";

import React, { useEffect } from "react";
import { useKeyboardShortcuts } from "@/lib/hooks/desktop/useKeyboardShortcuts";
import { useUIStore } from "@/store/client-state";

export const GlobalShortcuts: React.FC = () => {
  const { theme, setTheme } = useUIStore();

  // Register global shortcuts
  useKeyboardShortcuts(
    [
      {
        action: "global.toggle-dark-mode",
        handler: () => {
          const newTheme = theme === "dark" ? "light" : "dark";
          setTheme(newTheme);
          
          // Apply theme to document
          if (typeof document !== "undefined") {
            const root = document.documentElement;
            if (newTheme === "dark") {
              root.classList.add("dark");
            } else {
              root.classList.remove("dark");
            }
          }
        },
      },
      {
        action: "global.toggle-fullscreen",
        handler: () => {
          if (typeof document === "undefined") return;
          
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {
              // Fullscreen request failed - browser may not support it or user denied
            });
          } else {
            document.exitFullscreen().catch(() => {
              // Exit fullscreen failed
            });
          }
        },
      },
    ],
    "global"
  );

  // Apply theme on mount
  useEffect(() => {
    if (typeof document === "undefined") return;
    
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null; // This component doesn't render anything
};

