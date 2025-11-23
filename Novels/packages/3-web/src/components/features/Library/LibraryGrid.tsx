// Responsive grid layout for library items
"use client";

import React from "react";
import { LibraryItemCard, LibraryItemCardProps, EnhancedLibraryItem } from "./LibraryItemCard";

interface LibraryGridProps {
  items: EnhancedLibraryItem[];
  selectedItems: Array<string | number>;
  onSelectItem?: LibraryItemCardProps["onSelect"];
  onOpenItem?: LibraryItemCardProps["onOpen"];
  onAction?: LibraryItemCardProps["onAction"];
}

export const LibraryGrid: React.FC<LibraryGridProps> = ({
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {items.map((item) => (
        <LibraryItemCard
          key={item.id}
          item={item}
          layout="grid"
          isSelected={selectedMap.has(item.id.toString())}
          onSelect={onSelectItem}
          onOpen={onOpenItem}
          onAction={onAction}
        />
      ))}
    </div>
  );
};


