// List layout for library items
"use client";

import React from "react";
import { EnhancedLibraryItem, LibraryItemCard, LibraryItemCardProps } from "./LibraryItemCard";

interface LibraryListProps {
  items: EnhancedLibraryItem[];
  selectedItems: Array<string | number>;
  onSelectItem?: LibraryItemCardProps["onSelect"];
  onOpenItem?: LibraryItemCardProps["onOpen"];
  onAction?: LibraryItemCardProps["onAction"];
}

export const LibraryList: React.FC<LibraryListProps> = ({
  items,
  selectedItems,
  onSelectItem,
  onOpenItem,
  onAction,
}) => {
  if (!items.length) {
    return null;
  }

  const selectedMap = new Set(selectedItems.map((id) => id.toString()));

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <LibraryItemCard
          key={item.id}
          item={item}
          layout="list"
          isSelected={selectedMap.has(item.id.toString())}
          onSelect={onSelectItem}
          onOpen={onOpenItem}
          onAction={onAction}
        />
      ))}
    </div>
  );
};


