"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Laugh, HeartCrack, Angry, Sparkles, Smile } from "lucide-react";

export type ReactionType = "like" | "laugh" | "cry" | "angry" | "wow" | "love";

interface QuickReactionButtonsProps {
  onReaction: (reactionType: ReactionType) => void;
  selectedReaction?: ReactionType;
  className?: string;
}

const REACTIONS: Array<{ type: ReactionType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { type: "like", label: "Like", icon: Heart },
  { type: "laugh", label: "Haha", icon: Laugh },
  { type: "cry", label: "Cry", icon: HeartCrack },
  { type: "angry", label: "Angry", icon: Angry },
  { type: "wow", label: "Wow", icon: Sparkles },
  { type: "love", label: "Love", icon: Smile },
];

export const QuickReactionButtons: React.FC<QuickReactionButtonsProps> = ({
  onReaction,
  selectedReaction,
  className,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {REACTIONS.map((reaction) => {
        const Icon = reaction.icon;
        const isSelected = selectedReaction === reaction.type;
        return (
          <button
            key={reaction.type}
            onClick={() => onReaction(reaction.type)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              "border border-border hover:border-primary/50",
              isSelected
                ? "bg-primary/10 text-primary border-primary"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
            aria-label={reaction.label}
            title={reaction.label}
          >
            <Icon className={cn("h-4 w-4", isSelected && "fill-current")} />
            <span>{reaction.label}</span>
          </button>
        );
      })}
    </div>
  );
};

