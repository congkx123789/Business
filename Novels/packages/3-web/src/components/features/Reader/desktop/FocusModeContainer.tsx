// Focus Mode Container - Desktop text width limiter
"use client";

import React from "react";
import { useFocusMode } from "@/lib/hooks/desktop/useFocusMode";
import { cn } from "@/lib/utils";

interface FocusModeContainerProps {
  children: React.ReactNode;
}

export const FocusModeContainer: React.FC<FocusModeContainerProps> = ({ children }) => {
  const { isFocusMode, maxWidth, alignment } = useFocusMode();

  if (!isFocusMode) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <div
      className={cn("w-full px-4", alignment === "center" ? "mx-auto" : "ml-0")}
      style={{ maxWidth: `${maxWidth}ch` }}
    >
      {children}
    </div>
  );
};

