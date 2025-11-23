"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ForumModerationProps {
  threadId: string;
  onPin?: () => void;
  onLock?: () => void;
  isPinned?: boolean;
  isLocked?: boolean;
}

export const ForumModeration: React.FC<ForumModerationProps> = ({
  threadId,
  onPin,
  onLock,
  isPinned = false,
  isLocked = false,
}) => {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onPin}
        className="text-xs"
        disabled={!onPin}
      >
        {isPinned ? "Unpin" : "Pin"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onLock}
        className="text-xs"
        disabled={!onLock}
      >
        {isLocked ? "Unlock" : "Lock"}
      </Button>
    </div>
  );
};

