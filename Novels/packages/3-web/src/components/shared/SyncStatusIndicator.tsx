// SyncStatusIndicator component (Organism) - Shows sync status
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type SyncStatus = "synced" | "syncing" | "conflict" | "error" | "offline";

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status, className }) => {
  const statusConfig = {
    synced: {
      label: "Synced",
      color: "text-green-500",
      bgColor: "bg-green-500",
    },
    syncing: {
      label: "Syncing...",
      color: "text-blue-500",
      bgColor: "bg-blue-500",
    },
    conflict: {
      label: "Conflict",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
    },
    error: {
      label: "Error",
      color: "text-red-500",
      bgColor: "bg-red-500",
    },
    offline: {
      label: "Offline",
      color: "text-gray-500",
      bgColor: "bg-gray-500",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("h-2 w-2 rounded-full", config.bgColor)} />
      <span className={cn("text-sm", config.color)}>{config.label}</span>
    </div>
  );
};

