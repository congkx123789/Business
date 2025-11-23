"use client";

import React from "react";

interface PrivilegeStatusIndicatorProps {
  privilege?: {
    active: boolean;
    expiresAt?: string;
    advancedChaptersUnlocked?: number;
  };
}

export const PrivilegeStatusIndicator: React.FC<PrivilegeStatusIndicatorProps> = ({ privilege }) => {
  if (!privilege?.active) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        Privilege not active.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm text-primary">
      <p className="font-semibold">Privilege Active</p>
      {privilege.advancedChaptersUnlocked && (
        <p>{privilege.advancedChaptersUnlocked} advanced chapters unlocked</p>
      )}
      {privilege.expiresAt && (
        <p className="text-xs text-primary/80">
          Resets {new Date(privilege.expiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

