// Offline Indicator component
"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50",
        "px-4 py-2 rounded-md bg-yellow-500 text-yellow-900",
        "text-sm font-medium shadow-lg"
      )}
    >
      You are currently offline. Some features may be unavailable.
    </div>
  );
};

